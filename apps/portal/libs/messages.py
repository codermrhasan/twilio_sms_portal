# Download the helper library from https://www.twilio.com/docs/python/install
import os
from twilio.rest import Client

from django.conf import settings


class TwilioAPI():
    def __init__(self, account_sid, auth_token) -> None:
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.client = Client(self.account_sid, self.auth_token)
    
    def send_sms(self, from_number, to_number, text):
        message = self.client.messages.create(
            body=text,
            from_=from_number,
            status_callback = os.path.join(settings.BASE_URL, 'webhook', 'sent-sms-status/'),
            to=to_number,
        )
        return message