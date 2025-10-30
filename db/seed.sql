-- =====================================================
-- Seed Data for Asistify Backend
-- =====================================================

-- Clean existing data (optional - uncomment if needed)
-- DELETE FROM metric;
-- DELETE FROM receptionist;
-- DELETE FROM enterprise;
-- DELETE FROM enterprise_category;

-- =====================================================
-- Enterprise Categories
-- =====================================================
INSERT INTO enterprise_category (id, name, description, created_at, updated_at)
VALUES
  ('cat_healthcare_001', 'Healthcare', 'Medical clinics, hospitals, and healthcare providers', NOW(), NOW()),
  ('cat_dental_001', 'Dental', 'Dental clinics and orthodontic practices', NOW(), NOW()),
  ('cat_beauty_001', 'Beauty & Wellness', 'Salons, spas, and beauty centers', NOW(), NOW()),
  ('cat_fitness_001', 'Fitness', 'Gyms, yoga studios, and fitness centers', NOW(), NOW()),
  ('cat_legal_001', 'Legal Services', 'Law firms and legal consultation services', NOW(), NOW());

-- =====================================================
-- Enterprises
-- =====================================================
INSERT INTO enterprise (id, name, category_id, created_at, updated_at)
VALUES
  ('ent_001', 'HealthPlus Medical Center', 'cat_healthcare_001', NOW(), NOW()),
  ('ent_002', 'Bright Smile Dental Clinic', 'cat_dental_001', NOW(), NOW()),
  ('ent_003', 'Serenity Spa & Wellness', 'cat_beauty_001', NOW(), NOW()),
  ('ent_004', 'FitLife Gym', 'cat_fitness_001', NOW(), NOW()),
  ('ent_005', 'Downtown Legal Associates', 'cat_legal_001', NOW(), NOW()),
  ('ent_006', 'PrimeCare Medical Group', 'cat_healthcare_001', NOW(), NOW()),
  ('ent_007', 'Radiant Beauty Salon', 'cat_beauty_001', NOW(), NOW()),
  ('ent_008', 'Elite Fitness Center', 'cat_fitness_001', NOW(), NOW()),
  ('ent_009', 'Family Dental Care', 'cat_dental_001', NOW(), NOW()),
  ('ent_010', 'Martinez Law Firm', 'cat_legal_001', NOW(), NOW());

-- =====================================================
-- Receptionists (10 entries)
-- =====================================================
INSERT INTO receptionist (id, name, avatar, cellphone, enterprise_information, client_information, business_restrictions, level_formality, level_dynamism, anticipation_max_days, anticipation_min_days, enterprise_id, created_at, updated_at)
VALUES
  (
    'rec_001',
    'Sofia',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    '+1-555-0101',
    'HealthPlus Medical Center specializes in family medicine, pediatrics, and preventive care. We have 5 doctors available and operate Monday-Friday 8AM-6PM, Saturday 9AM-2PM.',
    'New patients need insurance information and ID. Returning patients should mention their patient ID for faster service.',
    'No appointments on Sundays. Emergency cases should call 911. Cancellations require 24-hour notice.',
    8,
    5,
    30,
    1,
    'ent_001',
    NOW(),
    NOW()
  ),
  (
    'rec_002',
    'Marcus',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    '+1-555-0102',
    'Bright Smile Dental offers general dentistry, cosmetic procedures, and orthodontics. We accept most insurance plans and offer flexible payment options.',
    'Please arrive 15 minutes early for paperwork. Bring your insurance card and a list of current medications.',
    'No walk-ins accepted. Children under 16 must be accompanied by a parent. Late arrivals may need to reschedule.',
    7,
    6,
    45,
    2,
    'ent_002',
    NOW(),
    NOW()
  ),
  (
    'rec_003',
    'Isabella',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella',
    '+1-555-0103',
    'Serenity Spa offers massage therapy, facials, body treatments, and wellness packages. Gift certificates available. Open 7 days a week 10AM-8PM.',
    'First-time clients receive a 20% discount. Please arrive 10 minutes early to fill out health history forms.',
    'Late cancellations (less than 4 hours notice) will be charged 50%. Please remove jewelry before treatments.',
    5,
    8,
    60,
    1,
    'ent_003',
    NOW(),
    NOW()
  ),
  (
    'rec_004',
    'Alex',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    '+1-555-0104',
    'FitLife Gym features state-of-the-art equipment, group classes, personal training, and a juice bar. Open 24/7 for members.',
    'Membership required for access. Guests can book a free trial session. Personal training sessions can be scheduled in advance.',
    'Proper gym attire required. No outside food or drinks except water. Classes have limited capacity.',
    4,
    9,
    14,
    1,
    'ent_004',
    NOW(),
    NOW()
  ),
  (
    'rec_005',
    'Victoria',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria',
    '+1-555-0105',
    'Downtown Legal Associates provides consultation in family law, real estate, and business law. Free 30-minute initial consultation available.',
    'Please bring all relevant documents to your appointment. Retainer agreements required for ongoing representation.',
    'Consultations by appointment only. Payment due at time of service. Attorney-client privilege applies to all communications.',
    9,
    3,
    21,
    3,
    'ent_005',
    NOW(),
    NOW()
  ),
  (
    'rec_006',
    'Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    '+1-555-0106',
    'PrimeCare Medical Group offers primary care, urgent care, and telemedicine services. We have specialists in cardiology, dermatology, and internal medicine.',
    'We accept all major insurance providers. Same-day appointments available for urgent matters. Telemedicine consultations can be scheduled online.',
    'Video appointments require a stable internet connection. Prescriptions will be sent to your preferred pharmacy. Follow-up appointments recommended every 6 months.',
    7,
    6,
    28,
    1,
    'ent_006',
    NOW(),
    NOW()
  ),
  (
    'rec_007',
    'Mia',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    '+1-555-0107',
    'Radiant Beauty Salon specializes in hair styling, coloring, nail services, and makeup. We use organic and cruelty-free products.',
    'Consultation is free for all services. Please specify any allergies or sensitivities. Loyalty program available for regular clients.',
    'Cancellations must be made 24 hours in advance. Color services require a patch test 48 hours prior. No refunds, only rescheduling.',
    6,
    7,
    30,
    2,
    'ent_007',
    NOW(),
    NOW()
  ),
  (
    'rec_008',
    'Ethan',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
    '+1-555-0108',
    'Elite Fitness Center offers CrossFit training, Olympic weightlifting, and nutrition coaching. Small group classes and one-on-one coaching available.',
    'Beginners welcome! All fitness levels accommodated. Bring a water bottle and towel. First class is free for new members.',
    'Athletes must sign a waiver. Proper athletic shoes required. No chalk allowed in certain areas. Maximum class size is 12 people.',
    5,
    8,
    10,
    1,
    'ent_008',
    NOW(),
    NOW()
  ),
  (
    'rec_009',
    'Olivia',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
    '+1-555-0109',
    'Family Dental Care provides comprehensive dental services for all ages. We specialize in pediatric dentistry and offer sedation options for anxious patients.',
    'Children receive a toy after each visit. Parents can stay in the room during treatment. We accept CareCredit and offer payment plans.',
    'Appointments for children under 5 are scheduled for morning hours only. Emergency dental services available during business hours.',
    8,
    5,
    35,
    2,
    'ent_009',
    NOW(),
    NOW()
  ),
  (
    'rec_010',
    'James',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    '+1-555-0110',
    'Martinez Law Firm specializes in immigration law, personal injury, and criminal defense. Multilingual staff available. Payment plans accepted.',
    'Confidentiality guaranteed. Bring government-issued ID and any relevant legal documents. Virtual consultations available for out-of-state clients.',
    'All consultations are confidential and protected by attorney-client privilege. Retainer required before case work begins. Court appearances require 48-hour notice.',
    9,
    4,
    15,
    2,
    'ent_010',
    NOW(),
    NOW()
  );

-- =====================================================
-- Metrics (Sample data for receptionists)
-- =====================================================
INSERT INTO metric (id, model_used, token_usage, response_time, receptionist_id, created_at, updated_at)
VALUES
  ('met_001', 'gpt-4o', 450, 1.2, 'rec_001', NOW(), NOW()),
  ('met_002', 'gpt-4o', 380, 1.1, 'rec_001', NOW(), NOW()),
  ('met_003', 'gpt-4o-mini', 280, 0.8, 'rec_002', NOW(), NOW()),
  ('met_004', 'gpt-4o', 520, 1.5, 'rec_003', NOW(), NOW()),
  ('met_005', 'gpt-4o-mini', 310, 0.9, 'rec_004', NOW(), NOW()),
  ('met_006', 'gpt-4o', 490, 1.3, 'rec_005', NOW(), NOW()),
  ('met_007', 'gpt-4o', 420, 1.2, 'rec_006', NOW(), NOW()),
  ('met_008', 'gpt-4o-mini', 295, 0.7, 'rec_007', NOW(), NOW()),
  ('met_009', 'gpt-4o', 510, 1.4, 'rec_008', NOW(), NOW()),
  ('met_010', 'gpt-4o', 460, 1.3, 'rec_009', NOW(), NOW()),
  ('met_011', 'gpt-4o', 475, 1.2, 'rec_010', NOW(), NOW());

-- =====================================================
-- End of Seed Data
-- =====================================================
