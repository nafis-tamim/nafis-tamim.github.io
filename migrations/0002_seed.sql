INSERT OR REPLACE INTO profile (key, value) VALUES
('name', 'Nafis Tamim'),
('eyebrow', 'STUDENT · BUILDER · DESIGNER'),
('headline', 'Learning seriously. Building visibly.'),
('intro', 'A student portfolio documenting academics, competitions, creative work and the things I build along the way.'),
('location', 'Bangladesh'),
('email', 'your-email@example.com'),
('availability', 'Open to competitions, collaborations & learning opportunities'),
('focus', 'Academic growth · Technology · Design'),
('footer_note', 'Built as a living academic archive — not a static CV.');

INSERT INTO entries (type,title,subtitle,description,date_label,tags,featured,sort_order) VALUES
('education','Current Education','Add your school / institution','Replace this placeholder from the admin dashboard with your current class, institution and academic details.','2026','["Academics"]',1,1),
('project','Featured Project','Your strongest project goes here','Show the problem, what you built, your role, tools used and the result. Keep it outcome-focused.','2026','["Build","Featured"]',1,1),
('achievement','Competition / Award','Add your best achievement','Use this space for olympiads, competitions, medals, rankings, ambassador roles or major recognition.','2026','["Achievement"]',1,1),
('certificate','Academic Certificate','Upload certificate PDF or image','Certificates can be uploaded from /admin and served from Cloudflare R2.','2026','["Certificate"]',0,1),
('activity','Leadership & Activities','Clubs · Ambassador · Volunteering','Document meaningful activities and what you actually contributed.','2026','["Leadership"]',0,1),
('skill','Design','Visual communication','Graphic design, presentation design and visual problem solving.','','["Creative"]',0,1),
('skill','Technology','Web & digital tools','Add the tools and technologies you genuinely use.','','["Technical"]',0,2);
