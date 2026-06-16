import { MenuItem, Table } from "../types";
import boorsokImage from "../assets/images/kyrgyz_boorsok_1781202777185.jpg";
import beshbarmakImage from "../assets/images/kyrgyz_beshbarmak_1781203136686.jpg";
import kuurdakImage from "../assets/images/kyrgyz_kuurdak_1781203376819.jpg";
import uzbekPlovImage from "../assets/images/uzbek_plov_1781203510987.jpg";
import lambShorpoImage from "../assets/images/lamb_shorpo_1781203608868.jpg";
import beefShorpoImage from "../assets/images/beef_shorpo_1781203747162.jpg";
import guiruLagmanImage from "../assets/images/uygur_guiru_lagman_1781203849376.jpg";
import shoroMaksymImage from "../assets/images/kyrgyz_shoro_maksym_1781204255486.jpg";
import kyrgyzLagmanImage from "../assets/images/kyrgyz_lagman_1781204344408.jpg";
import friedLagmanImage from "../assets/images/uygur_fried_lagman_1781204528753.jpg";
import tandoorLepeshkaImage from "../assets/images/tandoor_lepeshka_1781204678304.jpg";
import tandoorSamsaImage from "../assets/images/tandoor_samsa_1781204793906.jpg";
import chalapImage from "../assets/images/kyrgyz_chalap_drink_1781204928728.jpg";
import kymyzImage from "../assets/images/kyrgyz_kymyz_drink_1781205083213.jpg";
import mountainTanImage from "../assets/images/mountain_tan_drink_1781205297549.jpg";
import kazanKebabImage from "../assets/images/kazan_kebab_bishkek_style_1781205471162.jpg";
import mantiMeatImage from "../assets/images/kyrgyz_manti_beef_1781205892345.jpg";
import mantiPumpkinImage from "../assets/images/kyrgyz_manti_pumpkin_1781206027393.jpg";
import easternDessertsImage from "../assets/images/eastern_desserts_1781206197799.jpg";

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Beshbarmak Kyrgyz Style",
    russianName: "Кыргызский Бешбармак из конины",
    description: "Главное традиционное кыргызское блюдо. Нежнейшая томленая молодая конина и говядина на тонком домашнем тесте ручной кройки с классическим луковым соусом 'Чык' на основе густого наваристого мясного бульона, посыпанная свежей зеленью.",
    price: 490,
    category: "main",
    image: beshbarmakImage,
    isPopular: true
  },
  {
    id: "m2",
    name: "Uzbek Festive Plov",
    russianName: "Узбекский Плов Праздничный",
    description: "Настоящий праздничный плов на тончайшем отборном рисе Лазер с томленой халяльной говядиной, сладкой желтой морковью, ароматной зирой, цельной головкой чеснока, барбарисом и отварными перепелиными яйцами.",
    price: 420,
    category: "main",
    image: uzbekPlovImage,
    isPopular: true
  },
  {
    id: "m3",
    name: "Traditional Kyrgyz Kuurdak",
    russianName: "Куурдак по-кыргызски из баранины",
    description: "Легендарное сытное блюдо кочевников. Сочные кусочки свежей баранины и мякоти говядины, обжаренные в чугунном казане на сильном огне до румяной корочки с луком, курдючным жиром и запеченными дольками картофеля.",
    price: 460,
    category: "main",
    image: kuurdakImage,
    isPopular: true
  },
  {
    id: "m4",
    name: "Classic Manti with Chopped Beef",
    russianName: "Манты сочные с рубленым мясом (4 шт)",
    description: "Тончайшее пресное тесто, начиненное вручную мелко рубленой говядиной, сладким луком, капелькой курдюка для сочности и ароматными специями. Готовится исключительно на пару в мантоварке.",
    price: 350,
    category: "dumpling",
    image: mantiMeatImage,
    isPopular: true
  },
  {
    id: "m5",
    name: "Pumpkin Manti",
    russianName: "Манты сытные с тыквой (4 шт)",
    description: "Ароматные паровые манты со сладкой тыквой осенних сортов, мелко нарезанным луком и натуральным сливочным маслом. Подаются горячими с густым домашним сметанным соусом.",
    price: 300,
    category: "dumpling",
    image: mantiPumpkinImage
  },
  {
    id: "m6",
    name: "Kazan Kebab",
    russianName: "Казан-Кебаб по-бишкекски",
    description: "Томленая халяльная говядина на кости с румяным золотистым картофелем, приготовленная в закрытом казане со специями: зирой, кориандром и черным перцем. Подается на тонком лаваше со сладким крымским луком.",
    price: 470,
    category: "main",
    image: kazanKebabImage
  },
  {
    id: "m7",
    name: "Lamb Shorpo",
    russianName: "Шорпо из ароматной баранины",
    description: "Исконно восточный наваристый, кристально чистый и целебный бульон из фермерской баранины на косточке с крупно нарезанным картофелем, сочными овощами, нутом и горными травами.",
    price: 340,
    category: "main",
    image: lambShorpoImage
  },
  {
    id: "m8",
    name: "Beef Shorpo",
    russianName: "Шорпо из нежной говядины",
    description: "Легкий, но очень сытный классический суп на основе отборной говяжей грудинки, спелых томатов, сладкого перца, моркови и картофеля. Обильно украшается свежим укропом и кинзой.",
    price: 320,
    category: "main",
    image: beefShorpoImage
  },
  {
    id: "m9",
    name: "Kyrgyz Lagman",
    russianName: "Кыргызский классический Лагман",
    description: "Тягучая домашняя пшеничная лапша, вытянутая вручную поваром. Подается в глубокой косушке с густой и ароматной подливой 'вайла' из обжаренной говядины, редьки, сельдерея, фасоли и чеснока в наваристом бульоне.",
    price: 380,
    category: "main",
    image: kyrgyzLagmanImage,
    isPopular: true
  },
  {
    id: "m10",
    name: "Uygur Fried Lagman",
    russianName: "Уйгурский жареный Лагман",
    description: "Плотные жгуты ручной лапши, быстро обжаренные на раскаленном воке со слайсами говядины халяль, сладким перцем, стручковой фасолью, пекинской капустой и пряным чесночным соусом.",
    price: 390,
    category: "main",
    image: friedLagmanImage
  },
  {
    id: "m20",
    name: "Uygur Guiru Lagman",
    russianName: "Уйгурский Гуру Лагман",
    description: "Традиционный сухой лагман из эластичной домашней лапши ручной вытяжки. Подается со знаменитым соусом Гуру из обжаренной на максимальном огне сочной говядины, хрустящего болгарского перца, пекинской капусты, сельдерея и чесночного джусая.",
    price: 410,
    category: "main",
    image: guiruLagmanImage,
    isPopular: true
  },
  {
    id: "m11",
    name: "Golden Kyrgyz Boorsok",
    russianName: "Кыргызский Боорсок со сметаной",
    description: "Традиционная большая корзина воздушных, обжаренных в кипящем масле золотистых кыргызских пончиков из дрожжевого теста. Подаются с натуральной домашней сметаной и диким медом.",
    price: 180,
    category: "side",
    image: boorsokImage,
    isPopular: true
  },
  {
    id: "m12",
    name: "Tandoor Lepeshka",
    russianName: "Тандырные горячие Лепешки",
    description: "Легендарный круглый хлеб с узорчатым центром, выпекаемый нашими мастерами непосредственно на глиняных стенках печи-тандыра. С корочкой, посыпанной кунжутом, подается с пылу с жару.",
    price: 80,
    category: "side",
    image: tandoorLepeshkaImage
  },
  {
    id: "m13",
    name: "Traditional Samsy",
    russianName: "Самсы халяль с рубленым мясом",
    description: "Тандырная хрустящая самса из слоеного теста треугольной формы с сочной начинкой из рубленой говядины, лука и восточных специй, обильно сдобренная черным тмином (сезамом).",
    price: 130,
    category: "side",
    image: tandoorSamsaImage,
    isPopular: true
  },
  {
    id: "m14",
    name: "Eastern Desserts Assortment",
    russianName: "Восточные сладости (Ассорти)",
    description: "Изысканный десертный набор: тающая во рту медовая пахлава с грецкими орехами и фисташками, нежный рахат-лукум и сухофрукты, высушенные под солнцем Азии.",
    price: 250,
    category: "dessert",
    image: easternDessertsImage
  },
  {
    id: "m15",
    name: "Medovik Cake",
    russianName: "Домашний торт Медовик",
    description: "Мягкие и нежные коржи на натуральном горном меду, пропитанные легким сметанно-сливочным кремом. Тает во рту, прекрасный вкус вашего детства.",
    price: 220,
    category: "dessert",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    isPopular: true
  },
  {
    id: "m16",
    name: "Traditional Shoro Maksym",
    russianName: "Кыргызский напиток Шоро (Максым)",
    description: "Национальный тонизирующий и невероятно полезный напиток из ячменя, пшеницы и кукурузы. Отлично утоляет жажду, улучшает пищеварение и придает богатырскую силу кочевников.",
    price: 110,
    category: "drink",
    image: shoroMaksymImage
  },
  {
    id: "m17",
    name: "Refreshing Chalap",
    russianName: "Напиток Чалап охлаждающий",
    description: "Кисломолочный освежающий напиток на основе натурального разведенного максыма (или суусуна) с добавлением свежего укропа, соли и полезных бифидобактерий.",
    price: 100,
    category: "drink",
    image: chalapImage
  },
  {
    id: "m18",
    name: "Alpine Tan",
    russianName: "Бодрящий Тан горный",
    description: "Искрящийся прохладный напиток на основе мацуна с добавлением чистейшей минеральной воды, щепотки соли и свежей перечной мяты.",
    price: 100,
    category: "drink",
    image: mountainTanImage
  },
  {
    id: "m19",
    name: "Organic Kymyz",
    russianName: "Натуральный Кымыз (Кумыс)",
    description: "Король кыргызских напитков. Слабоалкогольный ферментированный напиток из парного кобыльего молока, приготовленный в традиционном кожаном сабе путем длительного взбивания. Обладает целебными свойствами.",
    price: 170,
    category: "drink",
    image: kymyzImage
  }
];

export const TABLES: Table[] = [
  {
    id: 1,
    name: "Стол 'Параллель'",
    capacity: 2,
    type: "standard",
    description: "Романтический столик на двоих у панорамного окна с видом на вечернюю улицу."
  },
  {
    id: 2,
    name: "Стол 'Восток'",
    capacity: 2,
    type: "booth",
    description: "Уединенная кабинка с высокими диванами и аутентичными коврами ручной работы."
  },
  {
    id: 3,
    name: "Стол 'Семейный'",
    capacity: 4,
    type: "standard",
    description: "Большой центральный стол с резными деревянными стульями для дружной семьи."
  },
  {
    id: 4,
    name: "Стол 'У Очага'",
    capacity: 4,
    type: "booth",
    description: "Расположен прямо у декоративного камина с теплыми бликами и мягкими коврами."
  },
  {
    id: 5,
    name: "Хан-Топчан 'Бишкек'",
    capacity: 8,
    type: "topchan",
    description: "Роскошный традиционный деревянный топчан. Вы сидите на мягких корпешках и подушках в окружении узоров горных хребтов."
  },
  {
    id: 6,
    name: "Хан-Топчан 'Ала-Тоо'",
    capacity: 8,
    type: "topchan",
    description: "Наш главный VIP-топчан у журчащего настенного ручья, застеленный кыргызскими коврами ручной работы (Шырдак)."
  }
];
