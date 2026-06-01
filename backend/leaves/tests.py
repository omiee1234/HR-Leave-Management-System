import datetime
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import LeaveBalance, LeaveRequest

User = get_user_model()

class LeaveManagementTests(APITestCase):
    """
    Comprehensive integration test suite for the Leave Management System API.
    """
    def setUp(self):
        # Create Test Manager
        self.manager = User.objects.create_superuser(
            email='manager_test@company.com',
            name='Test Manager',
            password='password123'
        )
        
        # Create Test Employee
        self.employee = User.objects.create_user(
            email='employee_test@company.com',
            name='Test Employee',
            password='password123',
            role='employee'
        )
        
        # Authenticate details
        self.employee_login_url = reverse('auth_login')
        
    def get_jwt_headers(self, user):
        response = self.client.post(self.employee_login_url, {
            'email': user.email,
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data['access']
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def test_employee_registration_creates_balance(self):
        """
        Verify that a LeaveBalance is automatically created for a new employee via signals.
        """
        new_employee = User.objects.create_user(
            email='new_emp@company.com',
            name='New Emp',
            password='password123',
            role='employee'
        )
        balance = LeaveBalance.objects.filter(user=new_employee).first()
        self.assertIsNotNone(balance)
        self.assertEqual(balance.vacation_balance, 12)
        self.assertEqual(balance.sick_balance, 8)
        self.assertEqual(balance.casual_balance, 6)

    def test_leave_request_past_dates(self):
        """
        Verify that an employee cannot apply for leave on past dates.
        """
        headers = self.get_jwt_headers(self.employee)
        url = reverse('employee_apply_leave')
        
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        data = {
            'leave_type': 'vacation',
            'start_date': yesterday.strftime('%Y-%m-%d'),
            'end_date': datetime.date.today().strftime('%Y-%m-%d'),
            'reason': 'Vacation trip'
        }
        
        response = self.client.post(url, data, format='json', **headers)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('start_date', response.data)

    def test_leave_request_insufficient_balance(self):
        """
        Verify that an employee cannot apply for leave exceeding their balance.
        """
        headers = self.get_jwt_headers(self.employee)
        url = reverse('employee_apply_leave')
        
        # Vacation balance is 12, let's request 15 days
        start = datetime.date.today() + datetime.timedelta(days=10)
        end = start + datetime.timedelta(days=14) # 15 days inclusive
        
        data = {
            'leave_type': 'vacation',
            'start_date': start.strftime('%Y-%m-%d'),
            'end_date': end.strftime('%Y-%m-%d'),
            'reason': 'Long trip'
        }
        
        response = self.client.post(url, data, format='json', **headers)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data or response.json())

    def test_leave_request_overlap(self):
        """
        Verify that an employee cannot submit overlapping leave requests.
        """
        headers = self.get_jwt_headers(self.employee)
        url = reverse('employee_apply_leave')
        
        start1 = datetime.date.today() + datetime.timedelta(days=5)
        end1 = start1 + datetime.timedelta(days=2) # 3 days
        
        # Submit first request
        data1 = {
            'leave_type': 'sick',
            'start_date': start1.strftime('%Y-%m-%d'),
            'end_date': end1.strftime('%Y-%m-%d'),
            'reason': 'First request'
        }
        response1 = self.client.post(url, data1, format='json', **headers)
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Submit overlapping second request
        start2 = start1 + datetime.timedelta(days=1)
        end2 = start2 + datetime.timedelta(days=3)
        data2 = {
            'leave_type': 'vacation',
            'start_date': start2.strftime('%Y-%m-%d'),
            'end_date': end2.strftime('%Y-%m-%d'),
            'reason': 'Overlapping request'
        }
        response2 = self.client.post(url, data2, format='json', **headers)
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manager_approval_reduces_balance(self):
        """
        Verify that a manager approving a leave request reduces the employee's balance.
        """
        headers_emp = self.get_jwt_headers(self.employee)
        url_apply = reverse('employee_apply_leave')
        
        start = datetime.date.today() + datetime.timedelta(days=5)
        end = start + datetime.timedelta(days=2) # 3 days
        
        data = {
            'leave_type': 'vacation',
            'start_date': start.strftime('%Y-%m-%d'),
            'end_date': end.strftime('%Y-%m-%d'),
            'reason': 'Vacation trip'
        }
        response_apply = self.client.post(url_apply, data, format='json', **headers_emp)
        self.assertEqual(response_apply.status_code, status.HTTP_201_CREATED)
        leave_id = response_apply.data['id']
        
        # Check initial balance (should still be 12 since request is Pending)
        balance = LeaveBalance.objects.get(user=self.employee)
        self.assertEqual(balance.vacation_balance, 12)
        
        # Log in as Manager and Approve
        headers_mgr = self.get_jwt_headers(self.manager)
        url_approve = reverse('manager_approve_leave', kwargs={'pk': leave_id})
        
        response_approve = self.client.put(url_approve, {}, format='json', **headers_mgr)
        self.assertEqual(response_approve.status_code, status.HTTP_200_OK)
        
        # Balance should now be reduced by 3 days -> 9
        balance.refresh_from_db()
        self.assertEqual(balance.vacation_balance, 9)

    def test_manager_rejection_does_not_reduce_balance(self):
        """
        Verify that manager rejection updates request status but does not reduce leave balance.
        """
        headers_emp = self.get_jwt_headers(self.employee)
        url_apply = reverse('employee_apply_leave')
        
        start = datetime.date.today() + datetime.timedelta(days=5)
        end = start + datetime.timedelta(days=1) # 2 days
        
        data = {
            'leave_type': 'casual',
            'start_date': start.strftime('%Y-%m-%d'),
            'end_date': end.strftime('%Y-%m-%d'),
            'reason': 'Casual reason'
        }
        response_apply = self.client.post(url_apply, data, format='json', **headers_emp)
        self.assertEqual(response_apply.status_code, status.HTTP_201_CREATED)
        leave_id = response_apply.data['id']
        
        # Reject as Manager
        headers_mgr = self.get_jwt_headers(self.manager)
        url_reject = reverse('manager_reject_leave', kwargs={'pk': leave_id})
        
        data_reject = {'rejection_reason': 'Too busy right now.'}
        response_reject = self.client.put(url_reject, data_reject, format='json', **headers_mgr)
        self.assertEqual(response_reject.status_code, status.HTTP_200_OK)
        self.assertEqual(response_reject.data['status'], 'Rejected')
        self.assertEqual(response_reject.data['rejection_reason'], 'Too busy right now.')
        
        # Balance should still be 6
        balance = LeaveBalance.objects.get(user=self.employee)
        self.assertEqual(balance.casual_balance, 6)

    def test_employee_cancel_pending_request(self):
        """
        Verify that an employee can cancel a pending leave request.
        """
        headers = self.get_jwt_headers(self.employee)
        url_apply = reverse('employee_apply_leave')
        
        start = datetime.date.today() + datetime.timedelta(days=2)
        end = start + datetime.timedelta(days=1) # 2 days
        
        data = {
            'leave_type': 'sick',
            'start_date': start.strftime('%Y-%m-%d'),
            'end_date': end.strftime('%Y-%m-%d'),
            'reason': 'Feeling unwell'
        }
        response_apply = self.client.post(url_apply, data, format='json', **headers)
        self.assertEqual(response_apply.status_code, status.HTTP_201_CREATED)
        leave_id = response_apply.data['id']
        
        # Cancel request
        url_cancel = reverse('employee_cancel_leave', kwargs={'pk': leave_id})
        response_cancel = self.client.put(url_cancel, {}, format='json', **headers)
        self.assertEqual(response_cancel.status_code, status.HTTP_200_OK)
        self.assertEqual(response_cancel.data['status'], 'Cancelled')

    def test_employee_cannot_cancel_approved_request(self):
        """
        Verify that an employee cannot cancel an already approved leave request.
        """
        headers_emp = self.get_jwt_headers(self.employee)
        url_apply = reverse('employee_apply_leave')
        
        start = datetime.date.today() + datetime.timedelta(days=2)
        end = start + datetime.timedelta(days=1)
        
        data = {
            'leave_type': 'sick',
            'start_date': start.strftime('%Y-%m-%d'),
            'end_date': end.strftime('%Y-%m-%d'),
            'reason': 'Sick day'
        }
        response_apply = self.client.post(url_apply, data, format='json', **headers_emp)
        leave_id = response_apply.data['id']
        
        # Approve as Manager
        headers_mgr = self.get_jwt_headers(self.manager)
        url_approve = reverse('manager_approve_leave', kwargs={'pk': leave_id})
        self.client.put(url_approve, {}, format='json', **headers_mgr)
        
        # Attempt to cancel as Employee
        url_cancel = reverse('employee_cancel_leave', kwargs={'pk': leave_id})
        response_cancel = self.client.put(url_cancel, {}, format='json', **headers_emp)
        self.assertEqual(response_cancel.status_code, status.HTTP_400_BAD_REQUEST)
