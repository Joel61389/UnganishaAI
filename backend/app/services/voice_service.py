import os
import json
import smtplib
import requests
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.audio import MIMEAudio
from gtts import gTTS


# ─── Voice Generation ─────────────────────────────────────────────────────────

def generate_voice_intro(intro_text: str, intro_id: str) -> str:
    """
    Converts the introduction text into speech using gTTS and saves it as an MP3.
    Returns the public URL path to the generated file.
    """
    try:
        app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        static_dir = os.path.join(os.path.dirname(app_dir), "static")
        audio_dir = os.path.join(static_dir, "audio")
        os.makedirs(audio_dir, exist_ok=True)

        filename = f"intro_{intro_id}.mp3"
        filepath = os.path.join(audio_dir, filename)

        # Strip emoji characters that gTTS can't handle
        clean_text = (
            intro_text
            .replace("👋", "").replace("🔥", "").replace("🚀", "")
            .replace("🎙️", "").replace("✅", "").replace("💡", "")
        )
        tts = gTTS(text=clean_text, lang='en', slow=False)
        tts.save(filepath)

        print(f"[VoiceService] Generated voice intro: {filepath}")
        return f"/static/audio/{filename}", filepath
    except Exception as e:
        print(f"[VoiceService] Error generating voice intro: {e}")
        return "", ""


# ─── Main Delivery Orchestrator ───────────────────────────────────────────────

def deliver_voice_intro(user, intro_text: str, intro_id: str, public_base_url: str = "") -> dict:
    """
    Delivers a warm voice introduction to a user.

    Strategy:
      1. Generate the voice MP3.
      2. Try WhatsApp first (Twilio) — send the audio as a media message to user.phone.
      3. If WhatsApp fails (number not on WhatsApp, no phone, or Twilio not configured),
         fall back to sending the MP3 as an email attachment to user.email.

    Returns a dict with keys: method ('whatsapp'|'email'|'failed'), success (bool), detail (str).
    """
    # Step 1: Generate voice MP3
    audio_url_path, audio_file_path = generate_voice_intro(intro_text, intro_id)
    if not audio_file_path:
        return {"method": "failed", "success": False, "detail": "Voice generation failed.", "audio_url": ""}

    # Step 2: Try WhatsApp delivery
    if user.phone:
        whatsapp_result = send_whatsapp_voice(
            to_phone=user.phone,
            body_text=intro_text,
            audio_file_path=audio_file_path,
            public_base_url=public_base_url
        )
        if whatsapp_result:
            print(f"[Delivery] Voice sent via WhatsApp to {user.phone} for user {user.name}")
            return {"method": "whatsapp", "success": True, "detail": f"Voice intro sent to WhatsApp: {user.phone}", "audio_url": audio_url_path}

    # Step 3: Fallback — send via email
    print(f"[Delivery] WhatsApp delivery failed or no phone number. Falling back to email for {user.email}")
    subject = f"Your Warm Introduction from Unganisha AI — {user.name}"
    email_result = send_email_with_attachment(
        to_email=user.email,
        subject=subject,
        body_text=intro_text,
        attachment_path=audio_file_path
    )
    if email_result:
        return {"method": "email", "success": True, "detail": f"Voice intro sent to email: {user.email}", "audio_url": audio_url_path}

    return {"method": "failed", "success": False, "detail": "All delivery methods failed.", "audio_url": audio_url_path}


# ─── WhatsApp Delivery ────────────────────────────────────────────────────────

def send_whatsapp_voice(to_phone: str, body_text: str, audio_file_path: str, public_base_url: str = "") -> bool:
    """
    Sends a WhatsApp message with the voice MP3 as a media attachment via Twilio.
    Returns True on success, False on any failure (including number not on WhatsApp).
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token  = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_WHATSAPP")  # e.g. whatsapp:+14155238886

    if not (account_sid and auth_token and from_number):
        print(f"[WhatsApp] Twilio not configured — cannot send WhatsApp to {to_phone}.")
        return False

    # Format the destination number
    formatted = to_phone.strip()
    if not formatted.startswith("whatsapp:"):
        if not formatted.startswith("+"):
            if formatted.startswith("0"):
                formatted = "+254" + formatted[1:]
            elif formatted.startswith("7") or formatted.startswith("1"):
                formatted = "+254" + formatted
        formatted = f"whatsapp:{formatted}"

    # Build media URL — Twilio needs a publicly accessible URL
    media_url = None
    if public_base_url and audio_file_path:
        filename = os.path.basename(audio_file_path)
        media_url = f"{public_base_url.rstrip('/')}/static/audio/{filename}"

    try:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        data = {
            "From": from_number,
            "To": formatted,
            "Body": f"🎙️ Warm introduction from Unganisha AI — tap below to listen!\n\n{body_text[:300]}..."
        }
        if media_url:
            data["MediaUrl"] = media_url

        response = requests.post(
            url,
            data=data,
            auth=(account_sid, auth_token),
            timeout=15
        )

        if response.status_code in [200, 201]:
            print(f"[WhatsApp] Voice intro sent to {formatted}.")
            return True
        else:
            error_body = response.json() if response.content else {}
            error_code = error_body.get("code", "")
            print(f"[WhatsApp] Twilio error {response.status_code} (code {error_code}): {error_body.get('message', response.text)}")

            # Twilio error 63003 = number not on WhatsApp → definitely fall back
            # Twilio error 21211 = invalid phone number → fall back
            return False
    except Exception as e:
        print(f"[WhatsApp] Exception sending WhatsApp: {e}")
        return False


# ─── Email Delivery ───────────────────────────────────────────────────────────

def send_email_with_attachment(to_email: str, subject: str, body_text: str, attachment_path: str) -> bool:
    """
    Sends a real email with the voice MP3 introduction attached if SMTP is configured.
    Returns True on success, False otherwise.
    """
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    smtp_from = os.getenv("SMTP_FROM", "introductions@unganisha.ai")

    if not (smtp_host and smtp_port and smtp_user and smtp_pass):
        print(f"[Email] SMTP not configured. Logging mock email to {to_email}.")
        _save_mock_email(to_email, subject, body_text, attachment_path)
        return False

    try:
        msg = MIMEMultipart()
        msg['From']    = smtp_from
        msg['To']      = to_email
        msg['Subject'] = subject

        # Plain-text body
        email_body = (
            f"Hi,\n\nPlease find your warm introduction from Unganisha AI attached as an audio file.\n\n"
            f"---\n\n{body_text}\n\n---\n\nBest regards,\nUnganisha AI"
        )
        msg.attach(MIMEText(email_body, 'plain'))

        # Attach voice MP3
        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, 'rb') as f:
                audio = MIMEAudio(f.read(), _subtype='mpeg')
                audio.add_header(
                    'Content-Disposition', 'attachment',
                    filename=os.path.basename(attachment_path)
                )
                msg.attach(audio)

        port = int(smtp_port)
        if port == 465:
            server = smtplib.SMTP_SSL(smtp_host, port)
        else:
            server = smtplib.SMTP(smtp_host, port)
            server.starttls()

        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"[Email] Voice intro email sent to {to_email}.")
        return True
    except Exception as e:
        print(f"[Email] Error sending email to {to_email}: {e}")
        _save_mock_email(to_email, subject, body_text, attachment_path)
        return False


def _save_mock_email(to_email: str, subject: str, body_text: str, attachment_path: str):
    """Saves a mock email record to disk when SMTP is not configured (for dev/logging)."""
    try:
        app_dir    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        static_dir = os.path.join(os.path.dirname(app_dir), "static")
        sent_dir   = os.path.join(static_dir, "sent")
        os.makedirs(sent_dir, exist_ok=True)

        ts       = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"email_{ts}.html"
        filepath = os.path.join(sent_dir, filename)
        audio_name = os.path.basename(attachment_path) if attachment_path else "None"

        html = f"""<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0b0f19;color:#f1f5f9;padding:20px;">
    <h2>[MOCK EMAIL LOG] Unganisha AI — Voice Introduction</h2>
    <p><b>To:</b> {to_email}</p>
    <p><b>Subject:</b> {subject}</p>
    <p><b>Attachment:</b> {audio_name}</p>
    <hr>
    <p style="white-space:pre-wrap;">{body_text}</p>
</body>
</html>"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"[Email] Mock email log saved: {filepath}")
    except Exception as e:
        print(f"[Email] Error saving mock email: {e}")
