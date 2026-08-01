-- Idempotent Razorpay payment id uniqueness (verify retries safe).

create unique index if not exists payment_submissions_razorpay_payment_uidx
  on public.payment_submissions (razorpay_payment_id)
  where razorpay_payment_id is not null;
