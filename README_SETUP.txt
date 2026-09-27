SIR KABS DRIVING SCHOOL — FINAL WEBSITE PACKAGE
===============================================

WHAT IS INCLUDED
----------------
- Responsive multi-page driving-school website.
- Automatic learner-success hero slider on the homepage.
- Mobile swipe support for the slider (no visible arrow/dot controls).
- Original clean learner / driving / test-day cards restored.
- Mobile-safe owner and inner-page image crops.
- Branded loading screen and scroll-progress indicator.
- Build Your Own Package calculator on courses.html.
- Custom package details carry into booking.html.
- Booking form sends through FormSubmit and can also send to Make.com.
- Real study PDFs are already linked on study.html.
- Real learner-success photos are already used in the gallery and hero slider.
- 404 page and robots.txt included.
- Large JPEG images were web-optimised for faster loading.

PAGES
-----
index.html      Homepage + automatic learner hero slider
courses.html    Courses, prices, package builder and vehicle hire
study.html      Study Hub with linked PDFs
success.html    Learner-success gallery
about.html      Owners / instructors and school story
booking.html    Dedicated booking form
404.html        Branded page-not-found screen
style.css       Website styling
script.js       Menu, loader, slider, package builder and booking logic

IMPORTANT SETTINGS
------------------

1. MAKE.COM WEBHOOK (OPTIONAL)
Open script.js and find:
  makeWebhookUrl: "PASTE_YOUR_MAKE_WEBHOOK_URL_HERE"

Leave it as-is if you are not using Make.com. The FormSubmit email route will still work.

2. FORMSUBMIT EMAIL
Current booking email:
  mwmakabane@gmail.com

If you change it, update CONFIG.formSubmitEmail in script.js.
FormSubmit may send a first-time activation email. Confirm it before expecting live bookings.

3. OWNER PHOTOS
Current files:
  assets/owners/Owner.jpeg
  assets/owners/Owner2.jpg

4. LEARNER / SUCCESS PHOTOS
Current files:
  assets/students/student1.jpeg
  assets/students/student2.jpeg
  ...
  assets/students/student9.jpeg

The same learner photos are used by the homepage slider and success gallery.

5. STUDY MATERIAL
The Study Hub currently links to:
  study-material/K53-for-Learners.pdf
  study-material/2 manual on road traffic signs jun 2012 final.pdf
  study-material/qustions.pdf

If you replace a PDF, either keep the same filename or update the matching href in study.html.

CUSTOM PACKAGE BUILDER
----------------------
Location:
  courses.html#package-builder

Current calculator values in script.js:
- Driving lessons: R250/hour
- Car Hire: R500
- Truck Hire: R650
- Code 8 Full Course: R6,000
- Code 10 Full Course: R7,000

When a visitor clicks "Continue with this package", the package is transferred into booking.html and included in the booking data.

WHATSAPP
--------
Number:
  27780861628

Icon:
  assets/whatsapp.svg

DEPLOYMENT
----------
Upload the CONTENTS of this folder to the public/root folder of your hosting.
Do not upload only index.html.

Keep this structure together:
/
  index.html
  about.html
  courses.html
  booking.html
  success.html
  study.html
  404.html
  robots.txt
  style.css
  script.js
  /assets
  /study-material

The home page is index.html.
