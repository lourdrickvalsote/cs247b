/*
  # Seed Default Break Activities

  Populates the break_activities table with 12 curated restorative activities
  across 5 categories: stretching, breathing, mindfulness, movement, eye_rest.

  Each activity includes step-by-step instructions with per-step timing.

  Categories:
    - Stretching (3 activities): Neck rolls, shoulder stretch, desk stretches
    - Breathing (3 activities): Box breathing, 4-7-8 technique, deep belly breathing
    - Mindfulness (2 activities): Body scan, gratitude pause
    - Movement (2 activities): Walking break, desk exercises
    - Eye Rest (2 activities): 20-20-20 rule, eye yoga
*/

INSERT INTO break_activities (title, description, category, duration_seconds, instructions, icon_name) VALUES

-- STRETCHING
(
  'Neck Rolls',
  'Gentle neck stretches to release tension from hunching over your desk.',
  'stretching',
  120,
  '[
    {"instruction": "Sit up straight and relax your shoulders down away from your ears.", "duration_seconds": 10},
    {"instruction": "Slowly drop your chin toward your chest. Feel the stretch along the back of your neck.", "duration_seconds": 15},
    {"instruction": "Gently roll your head to the right, bringing your ear toward your shoulder.", "duration_seconds": 15},
    {"instruction": "Continue rolling your head back, looking up at the ceiling.", "duration_seconds": 15},
    {"instruction": "Roll to the left side, ear toward shoulder.", "duration_seconds": 15},
    {"instruction": "Complete the circle back to center. Now reverse direction.", "duration_seconds": 10},
    {"instruction": "Roll slowly to the left first this time.", "duration_seconds": 15},
    {"instruction": "Continue the reverse circle, rolling back and to the right.", "duration_seconds": 15},
    {"instruction": "Return to center. Gently shake out your shoulders.", "duration_seconds": 10}
  ]'::jsonb,
  'circle-dot'
),
(
  'Shoulder Release',
  'Open up tight shoulders and upper back after focused desk work.',
  'stretching',
  150,
  '[
    {"instruction": "Stand up or sit tall. Inhale and lift both shoulders up toward your ears.", "duration_seconds": 10},
    {"instruction": "Hold the squeeze at the top.", "duration_seconds": 5},
    {"instruction": "Exhale and drop your shoulders completely. Repeat 3 more times.", "duration_seconds": 30},
    {"instruction": "Interlace your fingers behind your back. Straighten your arms.", "duration_seconds": 10},
    {"instruction": "Gently lift your hands away from your body. Open your chest.", "duration_seconds": 20},
    {"instruction": "Release. Now cross your right arm across your chest.", "duration_seconds": 5},
    {"instruction": "Use your left hand to gently pull your right arm closer. Hold.", "duration_seconds": 20},
    {"instruction": "Switch sides. Left arm across, right hand pulling gently.", "duration_seconds": 20},
    {"instruction": "Release and roll both shoulders backward 5 times.", "duration_seconds": 15},
    {"instruction": "Roll shoulders forward 5 times. Let your arms hang loose.", "duration_seconds": 15}
  ]'::jsonb,
  'move'
),
(
  'Desk Stretches',
  'A full-body stretch routine you can do right at your desk.',
  'stretching',
  180,
  '[
    {"instruction": "Stand up. Reach both arms overhead and interlace your fingers.", "duration_seconds": 5},
    {"instruction": "Stretch up tall, lengthening your whole body. Hold.", "duration_seconds": 15},
    {"instruction": "Lean gently to the right side. Feel the stretch along your left side.", "duration_seconds": 15},
    {"instruction": "Come back to center, then lean to the left.", "duration_seconds": 15},
    {"instruction": "Release arms down. Place hands on your lower back.", "duration_seconds": 5},
    {"instruction": "Gently arch backward, opening your chest to the ceiling.", "duration_seconds": 15},
    {"instruction": "Come back to neutral. Bend forward and let your arms hang.", "duration_seconds": 20},
    {"instruction": "Slowly roll up one vertebra at a time.", "duration_seconds": 10},
    {"instruction": "Hold the back of your chair. Step back and fold forward into a flat back.", "duration_seconds": 20},
    {"instruction": "Walk your hands up the chair and stand tall. Shake everything out.", "duration_seconds": 10},
    {"instruction": "Take 3 deep breaths. You are refreshed and ready.", "duration_seconds": 15}
  ]'::jsonb,
  'stretch-horizontal'
),

-- BREATHING
(
  'Box Breathing',
  'A calming 4-count breathing technique used by Navy SEALs to manage stress.',
  'breathing',
  240,
  '[
    {"instruction": "Find a comfortable position. Close your eyes if you like.", "duration_seconds": 10},
    {"instruction": "Breathe in slowly through your nose for 4 counts.", "duration_seconds": 5},
    {"instruction": "Hold your breath gently for 4 counts.", "duration_seconds": 5},
    {"instruction": "Exhale slowly through your mouth for 4 counts.", "duration_seconds": 5},
    {"instruction": "Hold empty for 4 counts. That is one cycle.", "duration_seconds": 5},
    {"instruction": "Inhale... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Hold... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Exhale... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Hold... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Continue this pattern. Inhale... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Hold... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Exhale... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Hold... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Keep going at your own pace for the remaining time.", "duration_seconds": 60},
    {"instruction": "Begin to breathe naturally. Notice how you feel.", "duration_seconds": 10}
  ]'::jsonb,
  'square'
),
(
  '4-7-8 Relaxation Breath',
  'A deeply relaxing breathing pattern that activates your parasympathetic nervous system.',
  'breathing',
  200,
  '[
    {"instruction": "Sit comfortably. Place the tip of your tongue behind your upper front teeth.", "duration_seconds": 10},
    {"instruction": "Exhale completely through your mouth, making a whoosh sound.", "duration_seconds": 5},
    {"instruction": "Close your mouth. Inhale quietly through your nose for 4 counts.", "duration_seconds": 5},
    {"instruction": "Hold your breath for 7 counts.", "duration_seconds": 8},
    {"instruction": "Exhale completely through your mouth for 8 counts. Whoosh.", "duration_seconds": 9},
    {"instruction": "That is one breath cycle. Inhale again... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Hold... 2... 3... 4... 5... 6... 7...", "duration_seconds": 8},
    {"instruction": "Exhale... 2... 3... 4... 5... 6... 7... 8...", "duration_seconds": 9},
    {"instruction": "Inhale... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Hold... 2... 3... 4... 5... 6... 7...", "duration_seconds": 8},
    {"instruction": "Exhale... 2... 3... 4... 5... 6... 7... 8...", "duration_seconds": 9},
    {"instruction": "One more cycle. Inhale... 2... 3... 4...", "duration_seconds": 5},
    {"instruction": "Hold... 2... 3... 4... 5... 6... 7...", "duration_seconds": 8},
    {"instruction": "Exhale... 2... 3... 4... 5... 6... 7... 8...", "duration_seconds": 9},
    {"instruction": "Return to normal breathing. Notice the calm.", "duration_seconds": 15}
  ]'::jsonb,
  'wind'
),
(
  'Deep Belly Breathing',
  'Simple diaphragmatic breathing to quickly reduce stress and refocus.',
  'breathing',
  180,
  '[
    {"instruction": "Place one hand on your chest and one on your belly.", "duration_seconds": 10},
    {"instruction": "Breathe in slowly through your nose. Feel your belly push out.", "duration_seconds": 8},
    {"instruction": "Your chest hand should stay relatively still.", "duration_seconds": 4},
    {"instruction": "Exhale slowly through pursed lips. Feel your belly fall.", "duration_seconds": 8},
    {"instruction": "Again, breathe in deeply into your belly... expanding...", "duration_seconds": 8},
    {"instruction": "And slowly release... letting everything go...", "duration_seconds": 8},
    {"instruction": "Continue at this pace. In through the nose, belly rises...", "duration_seconds": 8},
    {"instruction": "Out through the lips, belly falls...", "duration_seconds": 8},
    {"instruction": "Keep breathing deeply. Let each exhale be longer than the inhale.", "duration_seconds": 60},
    {"instruction": "Gently return to natural breathing. You should feel calmer now.", "duration_seconds": 15}
  ]'::jsonb,
  'cloud'
),

-- MINDFULNESS
(
  'Body Scan',
  'A quick mindfulness scan from head to toe to release physical tension.',
  'mindfulness',
  240,
  '[
    {"instruction": "Close your eyes. Take three deep breaths to settle in.", "duration_seconds": 15},
    {"instruction": "Bring your attention to the top of your head. Notice any sensation.", "duration_seconds": 15},
    {"instruction": "Move awareness to your forehead and face. Soften any tension.", "duration_seconds": 20},
    {"instruction": "Notice your jaw. Let it unclench. Let your tongue rest.", "duration_seconds": 15},
    {"instruction": "Bring attention to your neck and throat. Breathe into any tightness.", "duration_seconds": 20},
    {"instruction": "Scan your shoulders. Let them drop away from your ears.", "duration_seconds": 20},
    {"instruction": "Notice your arms, hands, and fingers. Let them be heavy and relaxed.", "duration_seconds": 20},
    {"instruction": "Bring awareness to your chest and upper back. Breathe deeply.", "duration_seconds": 20},
    {"instruction": "Scan your belly and lower back. Let your core soften.", "duration_seconds": 20},
    {"instruction": "Notice your hips, legs, and feet. Release any tension.", "duration_seconds": 20},
    {"instruction": "Now feel your whole body at once. Sitting here, breathing, alive.", "duration_seconds": 20},
    {"instruction": "Take three more breaths. Open your eyes when ready.", "duration_seconds": 15}
  ]'::jsonb,
  'scan-line'
),
(
  'Gratitude Pause',
  'A brief mindfulness exercise to shift perspective and boost mood.',
  'mindfulness',
  150,
  '[
    {"instruction": "Take a deep breath and close your eyes.", "duration_seconds": 10},
    {"instruction": "Think of one thing today that you are grateful for.", "duration_seconds": 20},
    {"instruction": "Picture it clearly in your mind. Let yourself smile.", "duration_seconds": 15},
    {"instruction": "Think of one person who has helped you recently.", "duration_seconds": 20},
    {"instruction": "Send them a silent thank you. Feel the warmth.", "duration_seconds": 15},
    {"instruction": "Think of one thing about yourself you appreciate.", "duration_seconds": 20},
    {"instruction": "It can be small. Your effort, your curiosity, your persistence.", "duration_seconds": 15},
    {"instruction": "Hold all three gratitudes together. Breathe them in.", "duration_seconds": 15},
    {"instruction": "Open your eyes. Carry this feeling back to your work.", "duration_seconds": 10}
  ]'::jsonb,
  'heart'
),

-- MOVEMENT
(
  'Walking Break',
  'Get your blood flowing with a short mindful walk around your space.',
  'movement',
  300,
  '[
    {"instruction": "Stand up from your desk. Shake out your hands and feet.", "duration_seconds": 15},
    {"instruction": "Begin walking at a comfortable pace. Leave your phone behind.", "duration_seconds": 10},
    {"instruction": "As you walk, notice the sensation of your feet on the ground.", "duration_seconds": 30},
    {"instruction": "Look around. Notice 3 things you can see in detail.", "duration_seconds": 30},
    {"instruction": "Notice 2 things you can hear right now.", "duration_seconds": 20},
    {"instruction": "Keep walking. Take slightly bigger steps. Swing your arms.", "duration_seconds": 30},
    {"instruction": "If possible, step outside or look out a window. Get some light.", "duration_seconds": 40},
    {"instruction": "Begin to walk back toward your desk at a slower pace.", "duration_seconds": 30},
    {"instruction": "Take 5 deep breaths as you walk.", "duration_seconds": 25},
    {"instruction": "Arrive back at your desk. Sit down slowly. You are recharged.", "duration_seconds": 15}
  ]'::jsonb,
  'footprints'
),
(
  'Desk Energizer',
  'Quick exercises to boost energy without leaving your desk area.',
  'movement',
  180,
  '[
    {"instruction": "Stand up behind your chair. Hold the backrest for balance.", "duration_seconds": 10},
    {"instruction": "Rise up onto your toes. Hold for 2 seconds. Lower down. Repeat 10 times.", "duration_seconds": 25},
    {"instruction": "Do 10 chair-assisted squats: lower until you almost sit, then stand.", "duration_seconds": 30},
    {"instruction": "March in place, lifting your knees high. Pump your arms.", "duration_seconds": 25},
    {"instruction": "Do 10 desk push-ups: hands on desk edge, body straight, push up and down.", "duration_seconds": 30},
    {"instruction": "Stand on one foot for 15 seconds. Switch feet.", "duration_seconds": 35},
    {"instruction": "Shake out your entire body. Arms, legs, everything loose.", "duration_seconds": 15},
    {"instruction": "Take 3 deep breaths. Sit back down feeling energized.", "duration_seconds": 10}
  ]'::jsonb,
  'zap'
),

-- EYE REST
(
  '20-20-20 Eye Reset',
  'Follow the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.',
  'eye_rest',
  120,
  '[
    {"instruction": "Stop looking at your screen. Look away from all devices.", "duration_seconds": 5},
    {"instruction": "Find something at least 20 feet (6 meters) away.", "duration_seconds": 5},
    {"instruction": "Focus on that distant object. Let your eyes fully relax.", "duration_seconds": 25},
    {"instruction": "Blink 10 times slowly to re-moisten your eyes.", "duration_seconds": 15},
    {"instruction": "Close your eyes. Cup your palms over them gently.", "duration_seconds": 5},
    {"instruction": "Rest in darkness. Let your eye muscles fully release.", "duration_seconds": 25},
    {"instruction": "Remove your hands. Keep eyes closed.", "duration_seconds": 10},
    {"instruction": "Slowly open your eyes. Look at something green if possible.", "duration_seconds": 15},
    {"instruction": "Your eyes are refreshed. Return to your screen.", "duration_seconds": 10}
  ]'::jsonb,
  'eye'
),
(
  'Eye Yoga',
  'Gentle eye exercises to reduce strain from prolonged screen time.',
  'eye_rest',
  150,
  '[
    {"instruction": "Sit comfortably. Keep your head still throughout.", "duration_seconds": 5},
    {"instruction": "Look as far up as you can. Hold for 3 seconds.", "duration_seconds": 5},
    {"instruction": "Look as far down as you can. Hold for 3 seconds.", "duration_seconds": 5},
    {"instruction": "Look as far right as you can. Hold.", "duration_seconds": 5},
    {"instruction": "Look as far left as you can. Hold.", "duration_seconds": 5},
    {"instruction": "Look to the upper right corner. Hold.", "duration_seconds": 5},
    {"instruction": "Look to the lower left corner. Hold.", "duration_seconds": 5},
    {"instruction": "Look to the upper left. Hold.", "duration_seconds": 5},
    {"instruction": "Look to the lower right. Hold.", "duration_seconds": 5},
    {"instruction": "Now make slow circles with your eyes. Clockwise, 5 rotations.", "duration_seconds": 20},
    {"instruction": "Reverse direction. Counter-clockwise, 5 rotations.", "duration_seconds": 20},
    {"instruction": "Close your eyes tightly for 5 seconds. Then open wide.", "duration_seconds": 8},
    {"instruction": "Repeat: squeeze shut... open wide...", "duration_seconds": 8},
    {"instruction": "Rub your palms together to warm them. Cup over closed eyes.", "duration_seconds": 10},
    {"instruction": "Rest in the warmth and darkness for a moment.", "duration_seconds": 20},
    {"instruction": "Remove hands and blink gently. Your eyes feel renewed.", "duration_seconds": 10}
  ]'::jsonb,
  'scan-eye'
);
