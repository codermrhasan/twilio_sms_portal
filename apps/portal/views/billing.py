from django.views import View
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from apps.portal.models import TwilioAccount, PhoneNumber, Contact, Conversation, Message
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core import serializers
from django.db.models import Count, Q, Value, F, ExpressionWrapper, FloatField
from django.db.models.functions import Coalesce
from django.utils.timezone import make_aware
from datetime import datetime, timedelta


class Billing(LoginRequiredMixin, View):
    def get(self, request):

        # today 
        today = datetime.today().date()

        data = request.GET

        startdate = data.get('startdate') if data.get('startdate') else today - timedelta(days=30)
        enddate = data.get('enddate') if data.get('enddate') else today
        
        # Define date range
        start_date = startdate
        end_date = enddate

        # Aggregate incoming and outgoing message counts per user
        history_data = TwilioAccount.objects.filter(
            user__isnull=False  # Ensures TwilioAccount is related to a user
        ).annotate(
            username=F('user__username'),
            total_incoming=Count(
                'conversations__messages',
                filter=Q(
                    conversations__messages__sender=Message.SENDER.CUSTOMER,
                    conversations__messages__created_at__range=(start_date, end_date)
                )
            ),
            total_outgoing=Count(
                'conversations__messages',
                filter=Q(
                    conversations__messages__sender=Message.SENDER.ME,
                    conversations__messages__created_at__range=(start_date, end_date)
                )
            ),
            total_messages=Count(
                'conversations__messages',
                filter=Q(
                    conversations__messages__created_at__range=(start_date, end_date)
                )
            )
        ).values('username', 'total_incoming', 'total_outgoing', 'total_messages')

        context = {
            'history': history_data,
            'startdate': startdate,
            'enddate': enddate
        }

        return render(request, 'portal/billing.html', context=context)