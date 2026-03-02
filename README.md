# Billing System

A simple Django billing application.

## How to run

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate      # this also loads 10 sample products automatically
python manage.py createsuperuser
python manage.py runserver
```

Go to http://127.0.0.1:8000/

Admin panel: http://127.0.0.1:8000/admin/

## Pages

- `/` - Create a new bill
- `/bill/<id>/` - View a generated bill
- `/history/` - View all past purchases



## Assumptions

- Net price is floored (not rounded) before calculating balance — e.g. 2357.60 becomes 2357.00
- Change is calculated using greedy algorithm (largest denomination first)
- Available denominations: 500, 50, 20, 10, 5, 2, 1
- Product price and tax are saved at time of purchase so history stays accurate
