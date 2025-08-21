import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import os
from dotenv import load_dotenv
from jinja2 import Template
import logging

load_dotenv()

class EmailService:
    """
    Servicio de envío de emails con plantillas HTML
    """
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_user = os.getenv("EMAIL_USER")
        self.email_password = os.getenv("EMAIL_PASSWORD")
        self.from_name = os.getenv("EMAIL_FROM_NAME", "Sistema Jurídico UCMC")
        
        if not self.email_user or not self.email_password:
            logging.warning("Email credentials not configured. Email sending will be disabled.")
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Enviar email con contenido HTML y texto plano
        """
        if not self.email_user or not self.email_password or self.email_user == "test@example.com":
            logging.warning(f"Email not sent to {to_email}: credentials not configured - SIMULATING SUCCESS FOR DEVELOPMENT")
            # En desarrollo, simular éxito para testing
            return True
        
        try:
            # Crear mensaje
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.email_user}>"
            message["To"] = to_email
            
            # Agregar contenido de texto plano si se proporciona
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            # Agregar contenido HTML
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Crear conexión SMTP segura
            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.email_user, self.email_password)
                server.send_message(message)
            
            logging.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logging.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_password_reset_email(
        self,
        to_email: str,
        user_name: str,
        reset_token: str
    ) -> bool:
        """
        Enviar email de recuperación de contraseña
        """
        subject = "Recuperación de Contraseña - Sistema Jurídico UCMC"
        
        # Plantilla HTML
        html_template = Template("""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }
        .header .university {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 5px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1e3a8a;
        }
        .token-container {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 2px solid #3b82f6;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .token {
            font-size: 32px;
            font-weight: bold;
            color: #1e3a8a;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        .token-label {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 10px;
        }
        .instructions {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
        }
        .warning {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Sistema Jurídico</h1>
            <div class="university">Universidad Colegio Mayor de Cundinamarca</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hola {{ user_name }},
            </div>
            
            <p>Has solicitado recuperar la contraseña de tu cuenta en el Sistema Jurídico UCMC.</p>
            
            <div class="token-container">
                <div class="token-label">Código de Verificación</div>
                <div class="token">{{ reset_token }}</div>
            </div>
            
            <div class="instructions">
                <strong>Instrucciones:</strong>
                <ol>
                    <li>Ve a la página de recuperación de contraseña</li>
                    <li>Ingresa el código de verificación mostrado arriba</li>
                    <li>Establece tu nueva contraseña</li>
                </ol>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    <li>Este código es válido por <strong>15 minutos</strong></li>
                    <li>Solo se puede usar una vez</li>
                    <li>Si no solicitaste este cambio, ignora este email</li>
                </ul>
            </div>
            
            <p>Si tienes problemas para recuperar tu contraseña, contacta al administrador del sistema.</p>
            
            <p>Saludos,<br>
            <strong>Equipo del Sistema Jurídico UCMC</strong></p>
        </div>
        
        <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas a este email.</p>
            <p>© 2025 Universidad Colegio Mayor de Cundinamarca - Sistema Jurídico</p>
        </div>
    </div>
</body>
</html>
        """)
        
        # Plantilla de texto plano
        text_content = f"""
Recuperación de Contraseña - Sistema Jurídico UCMC

Hola {user_name},

Has solicitado recuperar la contraseña de tu cuenta en el Sistema Jurídico UCMC.

Código de Verificación: {reset_token}

Instrucciones:
1. Ve a la página de recuperación de contraseña
2. Ingresa el código de verificación: {reset_token}
3. Establece tu nueva contraseña

IMPORTANTE:
- Este código es válido por 15 minutos
- Solo se puede usar una vez
- Si no solicitaste este cambio, ignora este email

Saludos,
Equipo del Sistema Jurídico UCMC

---
Este es un mensaje automático, por favor no respondas a este email.
© 2025 Universidad Colegio Mayor de Cundinamarca
        """
        
        html_content = html_template.render(
            user_name=user_name,
            reset_token=reset_token
        )
        
        return await self.send_email(to_email, subject, html_content, text_content)

# Instancia global del servicio de email
email_service = EmailService()