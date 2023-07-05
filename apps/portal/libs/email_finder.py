import re

def check_email_in_text(text):
    # Regular expression pattern to match an email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'

    # Search for email pattern in the paragraph
    match = re.search(email_pattern, text)

    if match:
        return True
    else:
        return False