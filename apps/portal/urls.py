from django.urls import path

from .views import (
    HomeView, receive_sms, sent_sms_status,
    ContactView,
    ConversationView,
    MessageView,
    ContactNConversationView,
)


urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('conversation/', ConversationView.as_view(), name='conversation'),
    path('message/', MessageView.as_view(), name='message'), # chat in frontend
    path('contact-n-conversation/', ContactNConversationView.as_view(), name='contact_n_conversation'),
    path('webhook/receive-sms/', receive_sms, name='webhook_receive_sms'),
    path('webhook/sent-sms-status/', sent_sms_status, name='webhook_sent_sms_status'),
]
