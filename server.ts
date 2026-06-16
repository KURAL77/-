import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Database for simplicity & instant persistence
const db = {
  bookings: [
    {
      id: "b1",
      name: "Алибек",
      phone: "+7 (999) 111-22-33",
      tableId: 3,
      date: "2026-06-12",
      time: "18:00",
      guests: 4,
      status: "confirmed",
      createdAt: new Date().toISOString()
    },
    {
      id: "b2",
      name: "Мария",
      phone: "+7 (900) 555-44-33",
      tableId: 5,
      date: "2026-06-12",
      time: "19:30",
      guests: 2,
      status: "confirmed",
      createdAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: "o1",
      customerName: "Руслан",
      phone: "+7 (911) 222-33-44",
      items: [
        { id: "m1", name: "Плов праздничный Бишкек", price: 420, quantity: 2 },
        { id: "m7", name: "Боорсоки со сметаной", price: 180, quantity: 1 }
      ],
      totalPrice: 1020,
      address: "ул. Ленина, д. 15, кв. 42",
      status: "delivered",
      createdAt: new Date().toISOString()
    }
  ],
  reviews: [
    {
      id: "r1",
      name: "Канатбек",
      rating: 5,
      comment: "Потрясающий праздничный плов! Мясо нежнейшее, тает во рту. Боорсоки горячие, хрустящие. Сервис на высоте, всё халяль!",
      date: "2026-06-10"
    },
    {
      id: "r2",
      name: "Екатерина",
      rating: 5,
      comment: "Очень душевное кафе. Заказывали манты и лагман, порции огромные, специи сбалансированы. Теперь это наше любимое место на ул. Нариманова!",
      date: "2026-06-08"
    },
    {
      id: "r3",
      name: "Алихан",
      rating: 4,
      comment: "Постоянно заказываю здесь доставку. Привозят быстро, блюда еще горячие. Любимый шашлык из баранины просто супер.",
      date: "2026-06-05"
    }
  ]
};

// Lazy initialization of Gemini client to prevent startup crash if key is undefined
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return aiClient;
}

// System Instruction preparing the bot with all cafe details (Menu, location, hours...)
const CAFE_BOT_INSTRUCTIONS = `
Ты — вежливый, гостеприимный и умный AI-ассистент халяль кафе "Бишкек", расположенного по адресу: г. Казань, ул. Нариманова 49.
Твой режим работы: каждый день с 09:00 до 23:00.
Все блюда в нашем меню строго 100% ХАЛЯЛЬ. Мы очень гордимся нашими традициями центральноазиатской (кыргызской) и восточной кухни.

Твоя цель — отвечать на вопросы гостей вежливо, кратко и аппетитно, помогать с выбором блюд, рассказывать об условиях бронирования и заказа.
Отвечай всегда на РУССКОМ языке. Будь дружелюбен и гостеприимен, используй восточную вежливость.

ИНФОРМАЦИЯ О КАФЕ ДЛЯ ОТВЕТОВ:
- Адрес: ул. Нариманова 49.
- Время работы: с 9:00 до 23:00.
- Телефон для прямой связи: 8-917-893-40-01.
- Особенности: Уютный зал, живая музыка по пятницам и субботам, детская игровая зона, намазхана (комната для намаза).

МЕНЮ И ЦЕНЫ:
1. Кыргызский Бешбармак из конины (томленая молодая конина и говядина на тонком тесте ручной кройки с луковым соусом 'Чык' и бульоном) — 490 руб.
2. Узбекский Плов Праздничный (отборнейший рис Лазер, говядина, желтая морковь, зира, барбарис, перепелиные яйца) — 420 руб.
3. Куурдак по-кыргызски из баранины (сытные обжаренные кусочки баранины, лук, курдюк и запеченный картофель) — 460 руб.
4. Манты сочные с рубленым мясом (тонкое тесто, рубленая говядина, лук, специи, готовые на пару) — 350 руб. (4 шт.)
5. Манты сытные с тыквой (паровые, спелая тыква, сливочное масло, лук) — 300 руб. (4 шт.)
6. Казан-Кебаб по-бишкекски (халяль говядина на косточке с золотистым картофелем и восточной заправкой) — 470 руб.
7. Шорпо из ароматной баранины (наваристый легкий бульон с сочным куском мяса на кости, картофелем и специями) — 340 руб.
8. Шорпо из нежной говядины (сытный суп с говяжьей грудинкой, томатами, картофелем и зеленью) — 320 руб.
9. Кыргызский классический Лагман (вытянутая вручную домашняя лапша, сочный соус 'вайла' из говядины и овощей) — 380 руб.
10. Уйгурский жареный Лагман (ручная лапша быстрой обжарки на воке со слайсами говядины халяль и яркими хрустящими овощами) — 390 руб.
11. Кыргызский Боорсок со сметаной (воздушные дрожжевые пончики, обжаренные во фритюре, порция с натуральным медом и сметаной) — 180 руб.
12. Тандырные горячие Лепешки (фирменный хлеб прямо из тандыра с кунжутной присыпкой) — 80 руб.
13. Самсы халяль с рубленым мясом (слоеные хрустящие пирожки с сочной начинкой из рубленой говядины и сезамом) — 130 руб.
14. Восточные сладости (тающая пахлава с орехами, фисташками, рахат-лукумом) — 250 руб.
15. Домашний торт Медовик (медовые коржи со сметанно-сливочным кремом) — 220 руб.
16. Кыргызский напиток Шоро (Максым) (густой ферментированный напиток из ячменя, пшеницы и кукурузы) — 110 руб.
17. Напиток Чалап охлаждающий (кисломолочный напиток на закваске со свежим укропом и солью) — 100 руб.
18. Бодрящий Тан горный (прохладный газированный напиток на основе мацуна с солью и мятой) — 100 руб.
19. Натуральный Кымыз (Кумыс) (традиционный тонизирующий напиток из кобыльего молока) — 170 руб.
20. Пиала горного чая (черный/зеленый чабрец, мята, лимон) — 120 руб.
21. Фирменный лимонад 'Ала-Арча' (тархун, базилик, лайм) — 150 руб.

БРОНИРОВАНИЕ И ЗАКАЗЫ:
- Забронировать столик можно прямо на нашем сайте через интерактивную 3D-карту зала.
- Всего в зале 6 столов: столы 1-2 (для пар, до 2 чел), столы 3-4 (семейные, до 4 чел), столы 5-6 (большие топчаны, до 8 чел в традиционном стиле).
- Доставка осуществляется бесплатно при заказе от 1000 рублей. В ином случае доставка составляет 150 рублей. Оформить заказ можно во вкладке "Доставка/Заказ".

Если гость просит забронировать стол или заказать еду, вежливо направь его к соответствующим разделам формы на сайте ("Забронировать стол" или "Онлайн-заказ"), пояснив, что они полностью интерактивны и работают в реальном времени!
`;

// API Endpoint for Chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Graceful fallback for offline development or missing key
      const lowerMsg = message.toLowerCase();
      let fallbackText = "Здравствуйте! Рады видеть вас в халяль кафе 'Бишкек'. ";
      
      if (lowerMsg.includes("адрес") || lowerMsg.includes("где находится") || lowerMsg.includes("карта")) {
        fallbackText += "Мы находимся по адресу: ул. Нариманова 49. Ждем вас с 9:00 до 23:00!";
      } else if (lowerMsg.includes("меню") || lowerMsg.includes("еда") || lowerMsg.includes("поесть") || lowerMsg.includes("плов") || lowerMsg.includes("манты") || lowerMsg.includes("беш") || lowerMsg.includes("куурдак") || lowerMsg.includes("кебаб") || lowerMsg.includes("шашлык") || lowerMsg.includes("напитки") || lowerMsg.includes("шоро") || lowerMsg.includes("кымыз") || lowerMsg.includes("лагман") || lowerMsg.includes("десерты")) {
        fallbackText += "В нашем меню есть традиционный Бешбармак из конины (490 руб), ароматный Куурдак (460 руб), Узбекский Плов (420 руб), Казан-Кебаб (470 руб), ручные Манты (350 руб), Самсы тандырные (130 руб), Лагман ручной лепки (380 руб), хрустящие Боорсоки (180 руб), домашний Медовик (220 руб), а также национальные напитки Шоро, Чалап, Тан и целебный Кымыз (170 руб). Вы можете сделать заказ онлайн прямо на нашем сайте во вкладке меню!";
      } else if (lowerMsg.includes("забронировать") || lowerMsg.includes("стол") || lowerMsg.includes("заказ")) {
        fallbackText += "Вы можете забронировать столик или оформить заказ прямо на нашем интерактивном сайте. Просто прокрутите к соответствующему блоку!";
      } else if (lowerMsg.includes("время") || lowerMsg.includes("работа") || lowerMsg.includes("до скольки")) {
        fallbackText += "Мы работаем каждый день с 9:00 до 23:00 без перерывов и выходных.";
      } else {
        fallbackText += "К сожалению, сейчас интерактивный AI-помощник работает в режиме автоответчика, но вы можете узнать всю информацию о меню, доставке и бронировании прямо на страницах нашего сайта. Ждем вас на ул. Нариманова 49!";
      }
      return res.json({ text: fallbackText });
    }

    // Prepare contents including history format for @google/genai chat structures
    // Let's use simple chat session structure details
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: CAFE_BOT_INSTRUCTIONS,
        temperature: 0.7,
      }
    });

    // Send history sequentially if available
    if (history && Array.isArray(history) && history.length > 0) {
      // In @google/genai SDK, chat state can be pre-populated or we can send messages.
      // But to avoid complex nested states, we can pass entire context in a single call or form simple message.
      // Let's construct previous conversation template for the model.
      const formattedContext = history
        .map((h: any) => `${h.role === "user" ? "Гость" : "Бот"}: ${h.text}`)
        .join("\n") + `\nГость: ${message}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContext,
        config: {
          systemInstruction: CAFE_BOT_INSTRUCTIONS,
          temperature: 0.7,
        }
      });
      return res.json({ text: response.text });
    } else {
      const response = await chat.sendMessage({ message: message });
      return res.json({ text: response.text });
    }

  } catch (error: any) {
    console.error("Gemini chatbot error:", error);
    res.status(500).json({ error: "Ошибка сервера при обработке чата. Пожалуйста, попробуйте еще раз." });
  }
});

// Bookings Endpoints
app.get("/api/bookings", (req, res) => {
  res.json(db.bookings);
});

app.post("/api/bookings", (req, res) => {
  const { name, phone, tableId, date, time, guests } = req.body;
  if (!name || !phone || !tableId || !date || !time || !guests) {
    return res.status(400).json({ error: "Пожалуйста, заполните все поля для бронирования." });
  }

  const newBooking = {
    id: "b" + (db.bookings.length + 1),
    name,
    phone,
    tableId: Number(tableId),
    date,
    time,
    guests: Number(guests),
    status: "confirmed",
    createdAt: new Date().toISOString()
  };

  db.bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// Orders Endpoints
app.get("/api/orders", (req, res) => {
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const { customerName, phone, items, totalPrice, address } = req.body;
  if (!customerName || !phone || !items || !totalPrice || !address) {
    return res.status(400).json({ error: "Пожалуйста, заполните информацию о заказе." });
  }

  const newOrder = {
    id: "o" + (db.orders.length + 1),
    customerName,
    phone,
    items,
    totalPrice: Number(totalPrice),
    address,
    status: "processing",
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);
  res.status(201).json(newOrder);
});

// Reviews Endpoints
app.get("/api/reviews", (req, res) => {
  // Sort reviews newest first
  const sortedReviews = [...db.reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sortedReviews);
});

app.post("/api/reviews", (req, res) => {
  const { name, rating, comment } = req.body;
  if (!name || !rating || !comment) {
    return res.status(400).json({ error: "Пожалуйста, заполните имя, оценку и комментарий." });
  }

  const newReview = {
    id: "r" + (db.reviews.length + 1),
    name,
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split("T")[0]
  };

  db.reviews.push(newReview);
  res.status(201).json(newReview);
});

// Setup Vite Dev Server / Prod Static Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
