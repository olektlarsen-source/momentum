// constants/exercises.ts

export const defaultDB = [
    // Bryst
    { name: 'Benkpress', en: 'Bench Press', muscle: 'Bryst', tags: ['benkpress', 'bench press', 'bryst', 'chest', 'press'] },
    { name: 'Skrå Benkpress (Stang)', en: 'Incline Bench Press', muscle: 'Bryst', tags: ['skrå benkpress', 'incline bench', 'bryst', 'chest', 'upper'] },
    { name: 'Skrå Benkpress (Manualer)', en: 'Incline Dumbbell Press', muscle: 'Bryst', tags: ['skrå', 'hantler', 'manualer', 'incline dumbbell', 'bryst', 'chest'] },
    { name: 'Benkpress (Manualer)', en: 'Dumbbell Press', muscle: 'Bryst', tags: ['benkpress manualer', 'dumbbell press', 'bryst', 'chest'] },
    { name: 'Dips', en: 'Dips', muscle: 'Bryst', tags: ['dips', 'bryst', 'chest', 'triceps'] },
    { name: 'Flyes (Manualer)', en: 'Dumbbell Flyes', muscle: 'Bryst', tags: ['flyes', 'dumbbell flyes', 'bryst', 'chest'] },
    { name: 'Kabel Crossovers', en: 'Cable Crossovers', muscle: 'Bryst', tags: ['kabel', 'cable crossover', 'bryst', 'chest'] },
    { name: 'Pec Dec Maskin', en: 'Pec Deck Machine', muscle: 'Bryst', tags: ['pec dec', 'maskin', 'machine', 'bryst', 'chest'] },
    { name: 'Pushups', en: 'Push-ups', muscle: 'Bryst', tags: ['pushups', 'armhevinger', 'bryst', 'chest'] },
    { name: 'Decline Benkpress', en: 'Decline Bench Press', muscle: 'Bryst', tags: ['decline', 'bryst', 'chest'] },
    
    // Bein
    { name: 'Knebøy', en: 'Squat', muscle: 'Bein', tags: ['knebøy', 'squat', 'bein', 'legs', 'bøy'] },
    { name: 'Frontbøy', en: 'Front Squat', muscle: 'Bein', tags: ['frontbøy', 'front squat', 'bein', 'legs'] },
    { name: 'Benpress', en: 'Leg Press', muscle: 'Bein', tags: ['benpress', 'leg press', 'bein', 'legs'] },
    { name: 'Bulgarsk Utfall', en: 'Bulgarian Split Squat', muscle: 'Bein', tags: ['bulgarsk', 'utfall', 'bulgarian', 'split squat', 'bein', 'legs'] },
    { name: 'Utfall (Gående)', en: 'Walking Lunges', muscle: 'Bein', tags: ['utfall', 'lunges', 'bein', 'legs'] },
    { name: 'Leg Extension', en: 'Leg Extension', muscle: 'Bein', tags: ['leg extension', 'spark', 'bein', 'legs', 'quads'] },
    { name: 'Leg Curl (Sittende)', en: 'Seated Leg Curl', muscle: 'Bein', tags: ['leg curl', 'hamstrings', 'bein', 'legs'] },
    { name: 'Leg Curl (Liggende)', en: 'Lying Leg Curl', muscle: 'Bein', tags: ['leg curl', 'hamstrings', 'bein', 'legs', 'liggende'] },
    { name: 'Strake Markløft', en: 'Stiff-Leg Deadlift', muscle: 'Bein', tags: ['strake', 'markløft', 'stiff leg', 'deadlift', 'hamstrings', 'bein', 'legs'] },
    { name: 'Tåhev (Stående)', en: 'Standing Calf Raise', muscle: 'Bein', tags: ['tåhev', 'calf raise', 'legger', 'calves', 'bein', 'legs'] },
    { name: 'Tåhev (Sittende)', en: 'Seated Calf Raise', muscle: 'Bein', tags: ['tåhev sittende', 'seated calf', 'legger', 'calves', 'bein', 'legs'] },
    { name: 'Hack Squat', en: 'Hack Squat', muscle: 'Bein', tags: ['hack squat', 'bein', 'legs', 'maskin'] },
    { name: 'Hip Thrust', en: 'Hip Thrust', muscle: 'Bein', tags: ['hip thrust', 'glutes', 'rumpe', 'bein', 'legs'] },
    { name: 'Glute Bridge', en: 'Glute Bridge', muscle: 'Bein', tags: ['glute bridge', 'rumpe', 'bein', 'legs'] },
    
    // Rygg
    { name: 'Markløft', en: 'Deadlift', muscle: 'Rygg', tags: ['markløft', 'deadlift', 'rygg', 'back', 'base'] },
    { name: 'Pullups', en: 'Pull-ups', muscle: 'Rygg', tags: ['pullups', 'kroppsheving', 'rygg', 'back', 'lats'] },
    { name: 'Chinups', en: 'Chin-ups', muscle: 'Rygg', tags: ['chinups', 'rygg', 'back', 'biceps'] },
    { name: 'Nedtrekk (Bredt grep)', en: 'Lat Pulldown (Wide)', muscle: 'Rygg', tags: ['nedtrekk', 'lat pulldown', 'rygg', 'back', 'lats'] },
    { name: 'Nedtrekk (Smalt grep)', en: 'Lat Pulldown (Close)', muscle: 'Rygg', tags: ['nedtrekk smalt', 'lat pulldown close', 'rygg', 'back'] },
    { name: 'Foroverbøyd Roing (Stang)', en: 'Barbell Row', muscle: 'Rygg', tags: ['foroverbøyd roing', 'barbell row', 'rygg', 'back'] },
    { name: 'Sittende Kabelroing', en: 'Seated Cable Row', muscle: 'Rygg', tags: ['sittende roing', 'cable row', 'rygg', 'back'] },
    { name: 'T-Bar Roing', en: 'T-Bar Row', muscle: 'Rygg', tags: ['t-bar', 'roing', 'rygg', 'back'] },
    { name: 'Enarms Hantelroing', en: 'Dumbbell Row', muscle: 'Rygg', tags: ['hantelroing', 'dumbbell row', 'rygg', 'back', 'manual'] },
    { name: 'Facepulls', en: 'Facepulls', muscle: 'Rygg', tags: ['facepulls', 'rygg', 'back', 'skuldre', 'rear delts'] },
    { name: 'Rumensk Markløft (RDL)', en: 'Romanian Deadlift (RDL)', muscle: 'Rygg', tags: ['rdl', 'rumensk', 'romanian deadlift', 'rygg', 'back', 'hamstrings'] },
    { name: 'Straight Arm Pulldown', en: 'Straight Arm Pulldown', muscle: 'Rygg', tags: ['straight arm', 'lats', 'rygg', 'back'] },
    { name: 'Shrugs (Stang)', en: 'Barbell Shrugs', muscle: 'Rygg', tags: ['shrugs', 'nakke', 'traps', 'rygg', 'back'] },
    { name: 'Shrugs (Manualer)', en: 'Dumbbell Shrugs', muscle: 'Rygg', tags: ['shrugs manualer', 'nakke', 'traps', 'rygg', 'back'] },
    
    // Skuldre
    { name: 'Militærpress', en: 'Overhead Press', muscle: 'Skuldre', tags: ['militærpress', 'overhead press', 'skuldre', 'shoulders', 'ohp'] },
    { name: 'Skulderpress (Manualer)', en: 'Dumbbell Shoulder Press', muscle: 'Skuldre', tags: ['skulderpress', 'dumbbell press', 'skuldre', 'shoulders'] },
    { name: 'Sidehev (Manualer)', en: 'Lateral Raises', muscle: 'Skuldre', tags: ['sidehev', 'lateral raises', 'skuldre', 'shoulders'] },
    { name: 'Sidehev (Kabel)', en: 'Cable Lateral Raises', muscle: 'Skuldre', tags: ['sidehev kabel', 'cable lateral', 'skuldre', 'shoulders'] },
    { name: 'Fronthev', en: 'Front Raises', muscle: 'Skuldre', tags: ['fronthev', 'front raises', 'skuldre', 'shoulders'] },
    { name: 'Omvendt Pec Dec', en: 'Reverse Pec Deck', muscle: 'Skuldre', tags: ['omvendt pec dec', 'reverse pec deck', 'skuldre', 'shoulders', 'rear delts'] },
    { name: 'Arnold Press', en: 'Arnold Press', muscle: 'Skuldre', tags: ['arnold press', 'skuldre', 'shoulders'] },
    { name: 'Upright Row', en: 'Upright Row', muscle: 'Skuldre', tags: ['upright row', 'stående roing', 'skuldre', 'shoulders'] },
    
    // Armer
    { name: 'Biceps Curl (Stang)', en: 'Barbell Curl', muscle: 'Armer', tags: ['biceps curl', 'barbell curl', 'armer', 'arms', 'biceps'] },
    { name: 'Biceps Curl (Manualer)', en: 'Dumbbell Curl', muscle: 'Armer', tags: ['biceps manualer', 'dumbbell curl', 'armer', 'arms', 'biceps'] },
    { name: 'Hammer Curls', en: 'Hammer Curls', muscle: 'Armer', tags: ['hammer curls', 'armer', 'arms', 'biceps'] },
    { name: 'Kabel Curls', en: 'Cable Curls', muscle: 'Armer', tags: ['kabel curls', 'cable curls', 'armer', 'arms', 'biceps'] },
    { name: 'Preacher Curl', en: 'Preacher Curl', muscle: 'Armer', tags: ['preacher curl', 'armer', 'arms', 'biceps'] },
    { name: 'Franskpress', en: 'Skullcrushers', muscle: 'Armer', tags: ['franskpress', 'skullcrushers', 'armer', 'arms', 'triceps'] },
    { name: 'Triceps Pushdown (Tau)', en: 'Triceps Pushdown (Rope)', muscle: 'Armer', tags: ['pushdown tau', 'rope pushdown', 'armer', 'arms', 'triceps'] },
    { name: 'Triceps Pushdown (Stang)', en: 'Triceps Pushdown (Bar)', muscle: 'Armer', tags: ['pushdown stang', 'bar pushdown', 'armer', 'arms', 'triceps'] },
    { name: 'Overhead Triceps Extension', en: 'Overhead Triceps Ext', muscle: 'Armer', tags: ['overhead triceps', 'armer', 'arms', 'triceps'] },
    { name: 'Smal Benkpress', en: 'Close Grip Bench Press', muscle: 'Armer', tags: ['smal benkpress', 'close grip', 'armer', 'arms', 'triceps', 'bryst'] },
    
    // Mage/Kjerne
    { name: 'Planken', en: 'Plank', muscle: 'Mage', tags: ['planken', 'plank', 'mage', 'abs', 'kjerne'] },
    { name: 'Crunches', en: 'Crunches', muscle: 'Mage', tags: ['crunches', 'mage', 'abs', 'kjerne'] },
    { name: 'Hengende Benhev', en: 'Hanging Leg Raises', muscle: 'Mage', tags: ['hengende benhev', 'hanging leg raises', 'mage', 'abs', 'kjerne'] },
    { name: 'Cable Crunches', en: 'Cable Crunches', muscle: 'Mage', tags: ['cable crunches', 'kabel crunches', 'mage', 'abs', 'kjerne'] },
    { name: 'Russian Twists', en: 'Russian Twists', muscle: 'Mage', tags: ['russian twists', 'mage', 'abs', 'kjerne'] },
    { name: 'Ab Wheel Rollout', en: 'Ab Wheel Rollout', muscle: 'Mage', tags: ['ab wheel', 'mage', 'abs', 'kjerne'] }
  ];