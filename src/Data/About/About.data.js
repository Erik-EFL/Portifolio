const handleCalculateAge = (birthDate) => {
  const today = new Date()
  const birthDateDate = new Date(birthDate)
  let age = today.getFullYear() - birthDateDate.getFullYear()
  const month = today.getMonth() - birthDateDate.getMonth()

  if (month < 0 || (month === 0 && today.getDate() < birthDateDate.getDate())) {
    age -= 1
  }

  return age
}

function getPeriodOfDay() {
  const currentHour = new Date().getHours();
  const period = getPeriodByHour(currentHour);
  const language = getLanguage();
  return translatePeriod(period, language);
}

function getPeriodByHour(currentHour) {
  if (currentHour >= 6 && currentHour < 12) {
    return "morning";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "afternoon";
  } else if (currentHour >= 18 && currentHour < 24) {
    return "night";
  } else {
    return "night";
  }
}

function getLanguage() {
  let language = 'enUS';
  try {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      language = storedLanguage;
    } else {
      language = navigator.language;
    }
  } catch (e) {
    console.error(e);
  }
  return language;
}

function translatePeriod(period, language) {
  if (language === 'en-US') {
    return `good ${period}`;
  }
  switch (period) {
    case "morning":
      return "bom dia";
    case "afternoon":
      return "boa tarde";
    case "night":
      return "boa noite";
    default:
      return "";
  }
}

export default {
  ptBR: [
    `Oi ${getPeriodOfDay()}! Como ja dito no nosso contato inicial eu sou o Erik, tenho ${handleCalculateAge('1995-04-11')} anos, sou guarulhense nascido e criado aqui no estado de São Paulo. `,
    'Atualmente as coisas que mais gosto de fazer são ir à academia, estudar, programar, ouvir música e jogar de vez en quando.',
    ' Os meus maiores amores são minha família, sendo meus pais, minha irmã meu irmão postiço e meu gato Naruto',
    `Sempre fui uma pessoa cheia de sonhos, alguns ja realizados, como por exemplo a conquista do meu apartamento e algumas viagens, e outros que ainda vou realizar que vem desde os meus 12 anos e que vou contar um pouco aqui.`,
    `Essa época foi onde eu dei meu primeiro passo profissional graças às pessoas mais importantes da minha vida, meus pais. Eles me permitiram ter meu primeiro contato com algo que eu já gostava e me deram meu primeiro computador.`,
    `O meu primeiro contato veio uns anos antes com a descoberta do computador e da internet.`,
    `Eu havia visto o filme Matrix com meu primo e depois disso ele ligou a discagem do modem e quando escutei o famoso barulinho da discagem aquilo me fascinou e me deixou curioso sobre o funcionamento e foi a partir de aí que comecei a me interessar pelo assunto.`,
    `Alguns anos depois de receber o presente eu acabei fazendo um curso de WebDesigne e foi onde tive meu primeiro contato com programação, novamente graças aos meus pais onde aprendi HTML, CSS e na época também Flash... Saudades.`,
    `Após terminar o ensino médio eu diferente dos meus amigos ja sabia o que queria fazer da minha vida. Então veio meu primeiro desafio, conseguir pagar meus estudos, foi então que arrumei um emprego como aprendiz na produção de uma empresa que fabrica plásticos filme na função de embalador, um lugar que não era o que eu queria, mas que foi um passo necessário para chegar no segundo ponto de impacto da minha jornada, que foi o curso o de gestão em Tecnologia de informação.`,
    `Foi nesse ponto que descobri os vários caminhos que tem a tecnologia e como elas despertavam minha criatividade e a curiosidade.`,
    'Após isso passei por outras escolas como a do querido Gustavo Guanabara onde aprendi sobre logica básica e algorítimo e depois a RocketSeat onde fiz alguns bootcamps e ainda faço até então.',
    'A certeza sobre trabalhar na area veio ao trabalhar em uma empresa que respira tecnologia, na época ainda uma start up, mas que mostrou como esse mercado era aconchegante e valoroso.',
    `Após quase 6 anos de carreira na Clear Sale, resolvi tomar uma decisão difícil e sai, pois não trabalhava com o que queria. Então conheci a Trybe, uma escola de programação onde aprendi sobre as tecnologias utilizadas para construir um site do back ao front-end utilizando as melhores tecnologias do mercado, tecnologias essas que utilizei para a construção de mais de 30 projetos, onde trabalhei muito em equipe, pontuando uma boa comunicação, e trabalhando diversas soft skills além de aplicar todas a hard skills necessárias para o melhor resultado possível.`,
    `Caso queira conversar comigo estou a disposição minhas redes sociais estão la em cima!`,
  ],
  enUS: [
    `Hi ${getPeriodOfDay()}! As already said in our initial contact I am Erik, I am ${handleCalculateAge('1995-04-11')} years old, I am a Guarulhos native born and raised here in the state of São Paulo.`,
    'Currently the things I like to do the most are go to the gym, study, program, listen to music and play from time to time.',
    'My biggest loves are my family, being my parents, my sister my stepbrother and my cat Naruto',
    `I have always been a person full of dreams, some already realized, such as the conquest of my apartment and some trips, and others that I will still realize that come since my 12 years and that I will tell a little here.`,
    `This time was where I took my first professional step thanks to the most important people in my life, my parents. They allowed me to have my first contact with something I already liked and gave me my first computer.`,
    `My first contact came a few years earlier with the discovery of the computer and the internet.`,
    `I had seen the Matrix movie with my cousin and then he turned on the modem dialing and when I heard the famous noise of the dialing it fascinated me and made me curious about the functioning and it was from there that I began to be interested in the subject.`,
    `A few years after receiving the gift I ended up doing a WebDesigne course and it was where I had my first contact with programming, again thanks to my parents where I learned HTML, CSS and at the time also Flash ... Miss.`,
    `After finishing high school I was different from my friends I already knew what I wanted to do with my life. So came my first challenge, to pay for my studies, it was then that I got a job as an apprentice in the production of a company that manufactures plastic film in the function of packer, a place that was not what I wanted, but that was a necessary step to reach the second point of impact of my journey, which was the course of management in Information Technology.`,
    `It was at this point that I discovered the various paths that technology has and how they awakened my creativity and curiosity.`,
    'After that I went through other schools like the dear Gustavo Guanabara where I learned about basic logic and algorithm and then the RocketSeat where I did some boot camps and still do to this day.',
    'The certainty about working in the area came when I worked in a company that breathes technology, at the time still a start up, but that showed how this market was cozy and valuable.',
    `After almost 6 years of career at Clear Sale, I decided to make a difficult decision and leave, because I didn't work with what I wanted. So I met Trybe, a programming school where I learned about the technologies used to build a site from back to front-end using the best technologies on the market, technologies that I used to build more than 30 projects, where I worked a lot in team, scoring good communication, and working several soft skills in addition to applying all the hard skills necessary for the best possible result.`,
    `If you want to talk to me I am available my social networks are up there!`,
  ],
}
