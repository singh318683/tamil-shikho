/*
  Tamil course content, built for SPEAKING: listening, understanding and answering.
  Learners see transliteration (English-style spelling) and hear audio. Tamil script is only
  shown if the learner turns it on in Testing tools. The script is still needed here because it
  is what the audio generator reads aloud.

  P(tamil, said as, meaning, needsCheck, note)   a phrase or word
  N(tamil, said as, meaning, digit)              a number

  pairs: [[a, b], ...] are small conversations inside a lesson: item a is heard, item b is the reply.
  needsCheck = true flags items a native speaker should double-check first.
  Audio file names come from the "said as" text, e.g. "vanakkam" -> audio/vanakkam.mp3
  and audio/vanakkam-slow.mp3
*/
(function () {
  const P = (ta, rom, en, check, note) => ({ gu: ta, rom, en, extra: '', note: note || '', check: !!check });
  const N = (ta, rom, en, digit) => ({ gu: ta, rom, en, extra: digit, note: '', check: false });

  window.COURSE = {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    voiceLang: 'ta',
    levels: [
      { id: 1, title: 'First conversations', sub: 'Greetings, names and asking for help' },
      { id: 2, title: 'Family', sub: 'Talk about the people in your life' },
      { id: 3, title: 'Daily life', sub: 'Numbers, food, shopping and getting around' },
      { id: 4, title: 'Festivals and fun', sub: 'Pongal, Deepavali and new year wishes' }
    ],
    lessons: [
      /* ---------------- Level 1: first conversations ---------------- */
      {
        id: 'a1', level: 1, kind: 'phrase', icon: '👋', title: 'Hello and goodbye',
        tip: 'Tamil vowels are pure and short unless doubled or marked long. Colloquial spoken Tamil (used throughout this course) often shortens endings that formal written Tamil keeps in full.',
        items: [
          P('வணக்கம்', 'vanakkam', 'hello'),
          P('எப்படி இருக்கீங்க?', 'eppadi irukkeenga?', 'how are you?'),
          P('நான் நல்லா இருக்கேன்', 'naan nallaa irukken', 'I\'m doing well'),
          P('நன்றி', 'nandri', 'thank you'),
          P('போய் வாறேன்', 'poi vaaren', 'goodbye', true)
        ],
        pairs: [[1, 2]]
      },
      {
        id: 'a2', level: 1, kind: 'phrase', icon: '🙏', title: 'Polite words',
        tip: 'இங்க பாருங்க (inga paarunga) literally means "look here" — it\'s how you politely get someone\'s attention, like a shopkeeper or a stranger.',
        items: [
          P('இங்க பாருங்க', 'inga paarunga', 'excuse me (to get someone\'s attention)', true),
          P('காலை வணக்கம்', 'kaalai vanakkam', 'good morning'),
          P('இரவு வணக்கம்', 'iravu vanakkam', 'good night'),
          P('மன்னிக்கவும்', 'mannikkavum', 'sorry / excuse me'),
          P('பரவாயில்லை', 'paravaayillai', 'no problem')
        ],
        pairs: [[3, 4]]
      },
      {
        id: 'a3', level: 1, kind: 'phrase', icon: '✅', title: 'Yes, no and maybe',
        items: [
          P('ஆமாம்', 'aamaam', 'yes'),
          P('இல்லை', 'illai', 'no'),
          P('இருக்கலாம்', 'irukkalaam', 'maybe'),
          P('எனக்குத் தெரியாது', 'enakku theriyaadhu', 'I don\'t know'),
          P('சரி', 'sari', 'okay / good'),
          P('எல்லாம் சரி', 'ellaam sari', 'it\'s fine', true)
        ]
      },
      {
        id: 'a4', level: 1, kind: 'phrase', icon: '💬', title: 'Your name and where you live',
        items: [
          P('உங்க பேரு என்ன?', 'unga peru enna?', 'what is your name?'),
          P('என் பேரு ராஜ்', 'en peru Raj', 'my name is Raj'),
          P('நீங்க எங்க இருக்கீங்க?', 'neenga enga irukkeenga?', 'where do you live?'),
          P('நான் அமெரிக்காவுல இருக்கேன்', 'naan Amerikaavula irukken', 'I live in America', true),
          P('உங்களை சந்திச்சது சந்தோஷம்', 'ungalai sandhichadhu sandhosham', 'nice to meet you', true)
        ],
        pairs: [[0, 1], [2, 3]]
      },
      {
        id: 'a5', level: 1, kind: 'phrase', icon: '🤔', title: 'When you don\'t understand',
        tip: 'These are your safety net. Using them early in a real conversation makes people slow down and help you.',
        items: [
          P('எனக்கு புரியல', 'enakku puriyala', 'I don\'t understand'),
          P('திரும்பச் சொல்லுங்க', 'thirumbach chollunga', 'please say it again', true),
          P('மெதுவா பேசுங்க', 'meduvaa pesunga', 'please speak slowly'),
          P('இதை தமிழ்ல எப்படி சொல்றது?', 'idhai Tamilla eppadi sollaradhu?', 'how do you say this in Tamil?', true),
          P('எனக்கு கொஞ்சம் தமிழ் தெரியும்', 'enakku konjam Tamil theriyum', 'I know a little Tamil'),
          P('உங்களுக்கு தமிழ் தெரியுமா?', 'ungalukku Tamil theriyumaa?', 'do you know Tamil?')
        ],
        pairs: [[5, 4]]
      },
      {
        id: 'cp1', level: 1, kind: 'checkpoint', icon: '✓', title: 'First conversations checkpoint',
        from: ['a1', 'a2', 'a3', 'a4', 'a5'], count: 10
      },
      /* ---------------- Level 2: family ---------------- */
      {
        id: 'f1', level: 2, kind: 'word', icon: '👪', title: 'Immediate family',
        items: [
          P('அம்மா', 'ammaa', 'mother'),
          P('அப்பா', 'appaa', 'father'),
          P('அண்ணன்', 'annan', 'elder brother'),
          P('அக்கா', 'akkaa', 'elder sister'),
          P('குடும்பம்', 'kudumbam', 'family')
        ]
      },
      {
        id: 'f2', level: 2, kind: 'word', icon: '👵', title: 'Grandparents',
        tip: 'Unlike Telugu or Hindi, everyday Tamil usually does not split grandmother/grandfather by side of the family — தாத்தா and பாட்டி work for both.',
        items: [
          P('தாத்தா', 'thaathaa', 'grandfather'),
          P('பாட்டி', 'paatti', 'grandmother')
        ]
      },
      {
        id: 'f3', level: 2, kind: 'word', icon: '🧑‍🤝‍🧑', title: 'Aunts and uncles',
        tip: 'Aunts and uncles have different names depending on which side of the family they are on, and whether they are older or younger than your parent.',
        items: [
          P('பெரியப்பா', 'periyappaa', 'father\'s elder brother'),
          P('சித்தப்பா', 'sithappaa', 'father\'s younger brother'),
          P('அத்தை', 'aththai', 'father\'s sister', true),
          P('மாமா', 'maamaa', 'mother\'s brother'),
          P('சித்தி', 'sithi', 'mother\'s younger sister'),
          P('பெரியம்மா', 'periyammaa', 'mother\'s elder sister')
        ]
      },
      {
        id: 'f4', level: 2, kind: 'phrase', icon: '🏠', title: 'Introduce your family',
        tip: 'என் (en, "my") never changes with gender, unlike in some other Indian languages — one less thing to worry about.',
        items: [
          P('இவன் என் அண்ணன்', 'ivan en annan', 'this is my brother'),
          P('இவள் என் அக்கா', 'ival en akkaa', 'this is my sister'),
          P('இவள் என் அம்மா', 'ival en ammaa', 'this is my mother'),
          P('இவன் என் அப்பா', 'ivan en appaa', 'this is my father'),
          P('உங்க குடும்பத்துல யாரு யாரு இருக்காங்க?', 'unga kudumbaththula yaaru yaaru irukkaanga?', 'who is in your family?', true),
          P('எங்க குடும்பத்துல நாலு பேர் இருக்காங்க', 'enga kudumbaththula naalu per irukkaanga', 'there are four people in my family', true)
        ],
        pairs: [[4, 5]]
      },
      {
        id: 'cp2', level: 2, kind: 'checkpoint', icon: '✓', title: 'Family checkpoint',
        from: ['f1', 'f2', 'f3', 'f4'], count: 10
      },
      /* ---------------- Level 3: daily life ---------------- */
      {
        id: 'd1', level: 3, kind: 'word', icon: '🔢', title: 'Numbers 1 to 5',
        items: [
          N('ஒன்று', 'ondru', 'one', '1'),
          N('இரண்டு', 'irandu', 'two', '2'),
          N('மூன்று', 'moondru', 'three', '3'),
          N('நான்கு', 'naangu', 'four', '4'),
          N('ஐந்து', 'ainthu', 'five', '5')
        ]
      },
      {
        id: 'd2', level: 3, kind: 'word', icon: '🔟', title: 'Numbers 6 to 10',
        items: [
          N('ஆறு', 'aaru', 'six', '6'),
          N('ஏழு', 'ezhu', 'seven', '7'),
          N('எட்டு', 'ettu', 'eight', '8'),
          N('ஒன்பது', 'onbathu', 'nine', '9'),
          N('பத்து', 'pathu', 'ten', '10')
        ]
      },
      {
        id: 'd3', level: 3, kind: 'word', icon: '📅', title: 'Days of the week',
        items: [
          P('திங்கள்கிழமை', 'thingatkizhamai', 'Monday'),
          P('செவ்வாய்க்கிழமை', 'sevvaaikizhamai', 'Tuesday'),
          P('புதன்கிழமை', 'budhankizhamai', 'Wednesday'),
          P('வியாழக்கிழமை', 'viyaazhakkizhamai', 'Thursday'),
          P('வெள்ளிக்கிழமை', 'vellikizhamai', 'Friday'),
          P('சனிக்கிழமை', 'sanikizhamai', 'Saturday'),
          P('ஞாயிற்றுக்கிழமை', 'gnaayitrukizhamai', 'Sunday')
        ]
      },
      {
        id: 'd4', level: 3, kind: 'word', icon: '🥛', title: 'Food and drink words',
        items: [
          P('தண்ணீர்', 'thanneer', 'water'),
          P('தேநீர்', 'thaneer', 'tea'),
          P('பால்', 'paal', 'milk'),
          P('சாதம்', 'saadham', 'rice'),
          P('பருப்பு', 'paruppu', 'lentil soup'),
          P('ரொட்டி', 'rotti', 'flatbread')
        ]
      },
      {
        id: 'd5', level: 3, kind: 'phrase', icon: '🍽️', title: 'Hungry and thirsty',
        items: [
          P('எனக்கு பசிக்குது', 'enakku pasikkudhu', 'I am hungry'),
          P('எனக்கு தாகமா இருக்கு', 'enakku thaagamaa irukku', 'I am thirsty'),
          P('சாப்பாடு தயார்', 'saapaadu thayaar', 'food is ready'),
          P('வர்றேன்', 'varren', 'I\'m coming'),
          P('வாங்க சாப்பிடலாம்', 'vaanga saapidalaam', 'let\'s eat'),
          P('எனக்கு கொஞ்சம் தண்ணீர் வேணும்', 'enakku konjam thanneer vENum', 'I would like some water', true)
        ],
        pairs: [[2, 3], [0, 4]]
      },
      {
        id: 'd6', level: 3, kind: 'phrase', icon: '😋', title: 'Enjoying the meal',
        items: [
          P('கொஞ்சம் அதிகமா', 'konjam adhigamaa', 'a little more'),
          P('போதும், நன்றி', 'podhum, nandri', 'that\'s enough, thank you'),
          P('இது ரொம்ப சுவையா இருக்கு', 'idhu romba suvaiyaa irukku', 'this is very tasty', true),
          P('நீங்க சாப்பிட்டீங்களா?', 'neenga saapittingalaa?', 'have you eaten?', true),
          P('இது என்ன?', 'idhu enna?', 'what is this?')
        ]
      },
      {
        id: 'd7', level: 3, kind: 'phrase', icon: '🛍️', title: 'Shopping',
        items: [
          P('எவ்வளவு விலை?', 'evvalavu vilai?', 'how much is it?'),
          P('பத்து ரூபாய்', 'pathu roobaai', 'ten rupees'),
          P('ரொம்ப விலை அதிகம்', 'romba vilai adhigam', 'it\'s too expensive'),
          P('கொஞ்சம் குறையுங்க', 'konjam kuraiyunga', 'please reduce it a little', true),
          P('எனக்கு இது வேணும்', 'enakku idhu vENum', 'I want this'),
          P('வேற ஒண்ணு காட்டுங்க', 'vera onnu kaattunga', 'show me another one', true)
        ],
        pairs: [[0, 1]]
      },
      {
        id: 'd8', level: 3, kind: 'phrase', icon: '🧭', title: 'Getting around',
        items: [
          P('எங்க இருக்கு?', 'enga irukku?', 'where is it?'),
          P('இங்க வாங்க', 'inga vaanga', 'come here'),
          P('நேரா போங்க', 'neraa ponga', 'go straight'),
          P('இடது பக்கம்', 'idadhu pakkam', 'on the left'),
          P('வலது பக்கம்', 'valadhu pakkam', 'on the right'),
          P('இங்க நிறுத்துங்க', 'inga niruthunga', 'stop here', true)
        ]
      },
      {
        id: 'd9', level: 3, kind: 'phrase', icon: '😊', title: 'Feelings and reactions',
        items: [
          P('ரொம்ப நல்லா இருக்கு', 'romba nallaa irukku', 'very good'),
          P('எனக்கு ரொம்ப சந்தோஷமா இருந்தது', 'enakku romba sandhoshamaa irundhadhu', 'I had fun', true),
          P('எனக்கு பிடிச்சிருக்கு', 'enakku pudichirukku', 'I liked it'),
          P('கவலைப்படாதீங்க', 'kavalaippadaadheenga', 'don\'t worry', true),
          P('ஆஹா!', 'aahaa!', 'wow!')
        ]
      },
      {
        id: 'cp3', level: 3, kind: 'checkpoint', icon: '✓', title: 'Daily life checkpoint',
        from: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9'], count: 12
      },
      /* ---------------- Level 4: festivals and fun ---------------- */
      {
        id: 'e1', level: 4, kind: 'phrase', icon: '🎉', title: 'Festival wishes',
        tip: 'The ending நல்வாழ்த்துக்கள் (nalvaazhthukkal) means "good wishes". Add it after any festival name.',
        items: [
          P('இனிய தமிழ் புத்தாண்டு நல்வாழ்த்துக்கள்', 'iniya Tamil puthaandu nalvaazhthukkal', 'happy Tamil new year', true),
          P('இனிய பொங்கல் நல்வாழ்த்துக்கள்', 'iniya Pongal nalvaazhthukkal', 'happy Pongal', true),
          P('இனிய தீபாவளி நல்வாழ்த்துக்கள்', 'iniya Deepaavali nalvaazhthukkal', 'happy Deepavali', true),
          P('இனிய பிறந்தநாள் நல்வாழ்த்துக்கள்', 'iniya piranthanaal nalvaazhthukkal', 'happy birthday', true),
          P('இனிய புத்தாண்டு நல்வாழ்த்துக்கள்', 'iniya puthaandu nalvaazhthukkal', 'happy new year', true)
        ]
      },
      {
        id: 'e2', level: 4, kind: 'word', icon: '🌾', title: 'Pongal',
        tip: 'Pongal, in mid-January, is a four-day harvest festival — the same season as Sankranti and Lohri elsewhere in India.',
        items: [
          P('பொங்கல்', 'Pongal', 'the harvest festival'),
          P('கோலம்', 'kolam', 'rice-flour floor design'),
          P('சர்க்கரைப் பொங்கல்', 'sarkkarai Pongal', 'sweet festive rice dish', true),
          P('மாட்டுப்பொங்கல்', 'maattu Pongal', 'the cattle-honoring day', true),
          P('உழவர் திருநாள்', 'uzhavar thirunaal', 'farmers\' festival', true)
        ]
      },
      {
        id: 'e3', level: 4, kind: 'phrase', icon: '🪔', title: 'Deepavali and Karthigai',
        items: [
          P('தீபாவளி', 'Deepaavali', 'the festival of lights'),
          P('கார்த்திகை தீபம்', 'Kaarthigai Deepam', 'the festival of lamps', true),
          P('ஆரத்தி', 'aarathi', 'prayer with a lamp'),
          P('வாங்க தீபாவளி கொண்டாடலாம்', 'vaanga Deepaavali kondaadalaam', 'let\'s celebrate Deepavali', true)
        ]
      },
      {
        id: 'cp4', level: 4, kind: 'checkpoint', icon: '✓', title: 'Festivals checkpoint',
        from: ['e1', 'e2', 'e3'], count: 10
      },
    ]
  };
})();
