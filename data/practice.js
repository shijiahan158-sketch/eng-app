/* eng-app · 题库练习数据（占位演示，可替换为真实题库）
   每条：{id, en, zh, part, freq, level, count, passage?, qs?, prompt?, model?, src?, ref?} */
window.PRACTICE = {
  reading: [
    { id:"r1", en:"The Pyramid of Cestius", zh:"罗马金字塔", part:"P1", freq:"高频", level:2.5, count:3,
      passage:"A 2,000-year-old pyramid in the city of Rome has been restored by archaeologists. Though Rome draws tourists to its many sites, the Pyramid of Cestius has never attracted much interest. After the Roman conquest of Egypt in 30 B.C., Egyptian architectural style became fashionable, and the pyramid was built as a burial tomb for a politician named Caius Cestius. Construction was completed within 330 days, and the structure had a layer of white marble on the outside.",
      qs:[ {q:"The Pyramid of Cestius has always been a popular tourist attraction.", a:"FALSE"},
           {q:"The pyramid was built after Egypt was conquered by Rome.", a:"TRUE"},
           {q:"Caius Cestius designed the pyramid himself.", a:"NOT GIVEN"} ] },
    { id:"r2", en:"The Story of Tea", zh:"茶的历史", part:"P1", freq:"次高频", level:3.0, count:3,
      passage:"Tea is the most widely consumed drink in the world after water. According to legend, tea was discovered in China around 2737 B.C. when leaves blew into the emperor's pot of boiling water. For centuries tea remained a luxury, but as cultivation spread it became an everyday drink. Trade routes carried tea across Asia and later to Europe, where it reshaped social customs and even sparked political conflict.",
      qs:[ {q:"Tea is the single most consumed drink worldwide.", a:"FALSE"},
           {q:"Tea was once considered a luxury item.", a:"TRUE"},
           {q:"The emperor disliked the taste of the first tea.", a:"NOT GIVEN"} ] },
    { id:"r3", en:"Urban Green Spaces", zh:"城市绿地", part:"P2", freq:"高频", level:3.5, count:3,
      passage:"As cities grow denser, planners increasingly value parks and green corridors. Studies show that access to green space lowers stress, encourages exercise and even cools neighbourhoods during heatwaves. Yet land is expensive, and green areas are often the first to be sacrificed for development. Some cities have responded creatively, turning rooftops, old railways and riverbanks into public gardens.",
      qs:[ {q:"Green spaces can reduce temperatures in cities.", a:"TRUE"},
           {q:"Building parks is usually cheaper than building housing.", a:"NOT GIVEN"},
           {q:"Green areas are rarely affected by urban development.", a:"FALSE"} ] },
    { id:"r4", en:"Sleep and Memory", zh:"睡眠与记忆", part:"P2", freq:"次高频", level:3.5, count:3,
      passage:"Why do humans spend a third of their lives asleep? Research suggests that sleep plays a crucial role in forming memories. During deep sleep the brain replays the day's experiences, strengthening important connections and discarding unnecessary ones. People deprived of sleep perform worse on tests of recall, and a short nap after learning can improve retention significantly.",
      qs:[ {q:"Sleep helps the brain strengthen useful memories.", a:"TRUE"},
           {q:"A nap after studying may improve memory.", a:"TRUE"},
           {q:"Most people need exactly eight hours of sleep.", a:"NOT GIVEN"} ] },
    { id:"r5", en:"Coral Reefs at Risk", zh:"珊瑚礁危机", part:"P3", freq:"高频", level:4.0, count:3,
      passage:"Coral reefs cover less than one percent of the ocean floor yet support a quarter of all marine species. These fragile ecosystems are built by tiny animals over thousands of years. Rising sea temperatures cause corals to expel the algae that feed them, a process known as bleaching. If conditions do not improve, bleached corals eventually die, threatening the fish and people who depend on them.",
      qs:[ {q:"Coral reefs support a large share of ocean life.", a:"TRUE"},
           {q:"Bleaching happens when water becomes too warm.", a:"TRUE"},
           {q:"Bleached coral always recovers within a year.", a:"FALSE"} ] },
    { id:"r6", en:"The History of Maps", zh:"地图的历史", part:"P3", freq:"非高频/低频", level:4.0, count:3,
      passage:"Long before satellites, people drew maps to make sense of their world. Early maps were often symbolic, placing a sacred city at the centre rather than showing true distances. As exploration expanded, mapmakers competed to record coastlines accurately, and errors could cost ships and lives. Today digital maps update in real time, yet they still reflect choices about what to include and leave out.",
      qs:[ {q:"Early maps always showed accurate distances.", a:"FALSE"},
           {q:"Mistakes on sea maps could be dangerous.", a:"TRUE"},
           {q:"Modern digital maps include everything that exists.", a:"NOT GIVEN"} ] }
  ],
  listening: [
    { id:"l1", en:"Campus Accommodation", zh:"校园住宿咨询", part:"Section 1", freq:"高频", level:2.0, count:3,
      transcript:"STUDENT: Hi, I'm looking for accommodation near campus for next term.\nOFFICER: Sure. We have shared flats and single rooms. A single room is 120 pounds a week, including bills.\nSTUDENT: And how far is it from the library?\nOFFICER: About a ten-minute walk. You'd need to pay a deposit of one month's rent.",
      qs:[ {q:"A single room costs ____ pounds per week.", a:"120"},
           {q:"The accommodation is about a ____-minute walk from the library.", a:"10"},
           {q:"The deposit equals ____ month's rent.", a:"one"} ] },
    { id:"l2", en:"Library Orientation", zh:"图书馆介绍", part:"Section 2", freq:"高频", level:2.5, count:0 },
    { id:"l3", en:"City Tour Guide", zh:"城市导览", part:"Section 2", freq:"次高频", level:3.0, count:0 },
    { id:"l4", en:"A Lecture on Climate", zh:"气候讲座", part:"Section 4", freq:"次高频", level:3.5, count:0 }
  ],
  writing: [
    { id:"w1", en:"Line Graph: Energy Use", zh:"图表作文·能源使用", part:"Task 1", freq:"高频", level:3.0, count:0,
      prompt:"The graph below shows the proportion of energy produced from four sources in a country between 1990 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
      model:"The line graph illustrates how four energy sources contributed to a country's power supply over three decades. Overall, while coal fell sharply, renewable energy rose steadily to become the leading source by 2020. In 1990, coal dominated at around 60%, but it declined consistently thereafter..." },
    { id:"w2", en:"Opinion Essay: Technology", zh:"议论文·科技影响", part:"Task 2", freq:"高频", level:3.5, count:0,
      prompt:"Some people believe that technology has made our lives too complicated, and that we should return to a simpler way of living. To what extent do you agree or disagree? Write at least 250 words.",
      model:"It is sometimes argued that modern technology has overcomplicated daily life and that a simpler existence would be preferable. While I acknowledge certain drawbacks, I largely disagree, as technology has brought clear benefits in communication, health and education..." },
    { id:"w3", en:"Discussion Essay: Education", zh:"讨论文·教育", part:"Task 2", freq:"次高频", level:3.5, count:0,
      prompt:"Some think children should start school as early as possible, while others believe they should begin later. Discuss both views and give your own opinion. Write at least 250 words.",
      model:"Opinions differ on the ideal age for children to begin formal schooling. Supporters of an early start point to the benefits of routine and social skills, whereas others argue that young children learn best through play..." }
  ],
  translation: [
    { id:"t1", en:"Traditional Festivals", zh:"中国传统节日", part:"汉译英", freq:"高频", level:3.0, count:0,
      src:"中国的传统节日丰富多彩，反映了中华民族悠久的历史和文化。春节是其中最重要的节日，人们会与家人团聚、吃年夜饭、放鞭炮，以辞旧迎新。",
      ref:"China's traditional festivals are rich and colourful, reflecting the long history and culture of the Chinese nation. The Spring Festival is the most important of these, when people reunite with family, share a New Year's Eve dinner and set off firecrackers to bid farewell to the old year and welcome the new." },
    { id:"t2", en:"High-speed Rail", zh:"高铁发展", part:"汉译英", freq:"高频", level:3.5, count:0,
      src:"近年来，中国的高速铁路发展迅速，已经成为世界上线路最长的高铁网络。它不仅缩短了城市之间的距离，也极大地方便了人们的出行。",
      ref:"In recent years, China's high-speed rail has developed rapidly and has become the longest high-speed rail network in the world. It has not only shortened the distance between cities but also greatly facilitated people's travel." },
    { id:"t3", en:"Tea Culture", zh:"茶文化", part:"汉译英", freq:"次高频", level:3.5, count:0,
      src:"茶在中国有着几千年的历史，是中国文化的重要组成部分。喝茶不仅是一种生活习惯，也是一种待客之道，体现了人们对自然与和谐的追求。",
      ref:"Tea has a history of several thousand years in China and is an important part of Chinese culture. Drinking tea is not only a way of life but also a way of treating guests, reflecting people's pursuit of nature and harmony." }
  ],
  real: [
    { id:"e1", en:"2025.12 Full Paper", zh:"2025 年 12 月真题（一）", part:"整套", freq:"最新", level:3.5, count:0, sections:["听力","阅读","写作","翻译"] },
    { id:"e2", en:"2025.06 Full Paper", zh:"2025 年 6 月真题", part:"整套", freq:"经典", level:3.5, count:0, sections:["听力","阅读","写作","翻译"] }
  ],
  mock: [
    { id:"m1", en:"Full Mock Test A", zh:"全真模考（一）", part:"限时整套", freq:"推荐", level:3.5, count:0, sections:["听力","阅读","写作","翻译"] },
    { id:"m2", en:"Full Mock Test B", zh:"全真模考（二）", part:"限时整套", freq:"推荐", level:4.0, count:0, sections:["听力","阅读","写作","翻译"] }
  ]
};
