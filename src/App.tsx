import React, { useState, useEffect } from "react";
import {
  Utensils,
  Clock,
  MapPin,
  Phone,
  ShoppingBag,
  Check,
  ChevronRight,
  Star,
  User,
  Calendar,
  Users,
  Award,
  Navigation,
  ThumbsUp,
  Plus,
  Minus,
  Trash2,
  Heart,
  MessageSquare,
  Coffee,
  CheckCircle2,
  Info
} from "lucide-react";

import { MenuItem, Table, TableBooking, FoodOrder, Review } from "./types";
import { MENU_ITEMS, TABLES } from "./data/menuData";
import Interactive3DMap from "./components/Interactive3DMap";
import Chatbot from "./components/Chatbot";
import plovFloatingImage from "./assets/images/plov_floating_dish_1781206603491.jpg";

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"menu" | "reserve" | "order" | "reviews">("menu");

  // Cart State
  const [cartItems, setCartItems] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);

  // Active bookings list from server
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [bookingFormData, setBookingFormData] = useState({
    name: "",
    phone: "",
    tableId: 3,
    date: "2026-06-12",
    time: "18:00",
    guests: 4
  });
  const [bookingSuccessTicket, setBookingSuccessTicket] = useState<any | null>(null);

  // Order submission details
  const [orderFormData, setOrderFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [orderStep, setOrderStep] = useState<number>(0);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewFormData, setReviewFormData] = useState({
    name: "",
    rating: 5,
    comment: ""
  });
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>("");

  // Search and Category for Menu
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 3D Plate Simulator Rotation State
  const [heroPlateRotation, setHeroPlateRotation] = useState<number>(0);
  const [heroPlateTilt, setHeroPlateTilt] = useState<number>(12);
  const [activeIngredient, setActiveIngredient] = useState<string | null>(null);

  // Live Cafe Open Status Checker
  const [isOpenNow, setIsOpenNow] = useState<boolean>(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  // Load reviews, bookings on mount
  useEffect(() => {
    fetchReviews();
    fetchBookings();

    // Check Cafe Open/Close
    const checkOpenStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      const absoluteMinutes = currentHour * 60 + currentMinutes;

      const openMinutes = 9 * 60;  // 09:00
      const closeMinutes = 23 * 60; // 23:00

      const open = absoluteMinutes >= openMinutes && absoluteMinutes < closeMinutes;
      setIsOpenNow(open);

      setCurrentTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update order status simulation
  useEffect(() => {
    if (placedOrder && orderStep < 3) {
      const timer = setTimeout(() => {
        setOrderStep((prev) => prev + 1);
      }, 7000); // Transitions through Preparing, Courier, Delivered
      return () => clearTimeout(timer);
    }
  }, [placedOrder, orderStep]);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.error("Failed to load bookings:", e);
    }
  };

  // Get booked table ID list for the selected booking date/time
  const getBookedTableIds = () => {
    return bookings
      .filter((b) => b.date === bookingFormData.date && b.status !== "cancelled")
      .map((b) => Number(b.tableId));
  };

  // Add Item to shopping cart
  const addToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    // Shake shopping bag animation or auto open summary drawer
    setShowCartDrawer(true);
  };

  // Modify cart item quantity
  const updateCartQty = (itemId: string, increment: boolean) => {
    setCartItems((prev) => {
      return prev
        .map((i) => {
          if (i.item.id === itemId) {
            const newQty = increment ? i.quantity + 1 : i.quantity - 1;
            return { ...i, quantity: newQty };
          }
          return i;
        })
        .filter((i) => i.quantity > 0);
    });
  };

  // Remove Item fully
  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  // Calculate cart pricing
  const getSubtotal = () => {
    return cartItems.reduce((acc, current) => acc + current.item.price * current.quantity, 0);
  };

  const getDeliveryCost = () => {
    const sub = getSubtotal();
    if (sub === 0) return 0;
    return sub >= 1000 ? 0 : 150;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryCost();
  };

  // Handle table booking submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingFormData)
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Ошибка при создании брони");
        return;
      }

      const bookedObj = await res.json();
      setBookingSuccessTicket(bookedObj);
      fetchBookings(); // refresh active tables state
    } catch (err) {
      console.error(err);
      alert("Не удалось отправить запрос. Пожалуйста, попробуйте еще раз.");
    }
  };

  // Handle online delivery order submit
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Ваша корзина пуста!");
      return;
    }

    try {
      const orderItems = cartItems.map((cart) => ({
        id: cart.item.id,
        name: cart.item.russianName,
        price: cart.item.price,
        quantity: cart.quantity
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: orderFormData.name,
          phone: orderFormData.phone,
          items: orderItems,
          totalPrice: getTotal(),
          address: orderFormData.address
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Ошибка при оформлении заказа");
        return;
      }

      const placedObj = await res.json();
      setPlacedOrder(placedObj);
      setOrderStep(1); // Set state to 'Received / Принят'
      setCartItems([]); // Clear local shopping bag
      setShowCartDrawer(false);
    } catch (err) {
      console.error(err);
      alert("Не удалось отправить заказ. Попробуйте снова.");
    }
  };

  // Handle review submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewFormData)
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Ошибка при добавлении отзыва");
        return;
      }

      setReviewSuccessMsg("Успешно! Спасибо за деликатный отзыв, он опубликован.");
      setReviewFormData({ name: "", rating: 5, comment: "" });
      fetchReviews();

      setTimeout(() => {
        setReviewSuccessMsg("");
      }, 5000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Menu Items
  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    const coordsMatch = item.russianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const qtyMatch = selectedCategory === "all" || item.category === selectedCategory;
    return coordsMatch && qtyMatch;
  });

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream/90 flex flex-col relative overflow-x-hidden selection:bg-brand-gold selection:text-brand-dark">
      
      {/* Background traditional oriental pattern overlay */}
      <div className="absolute inset-0 bg-repeat opacity-5 pointer-events-none [background-size:160px] bg-[url('https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=300')]"></div>

      {/* Top Notification Status Banner */}
      <div id="top-status-header" className="bg-gradient-to-r from-brand-emerald to-brand-emerald-light border-b border-brand-gold/30 text-xs py-2 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 z-30 relative shadow-md">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-brand-gold text-brand-dark rounded-full p-0.5 px-1.5 font-bold font-serif tracking-wider text-[10px]">
            ХАЛЯЛЬ
          </span>
          <span className="font-medium tracking-wide">
            🕌 Меню строго халяль. Фермерское мясо. Пряные горные травы из Кыргызстана.
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${isOpenNow ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
            <span>
              {isOpenNow ? "СЕЙЧАС ОТКРЫТО" : "СЕЙЧАС ЗАКРЫТО"} • Режим: 09:00 - 23:00
            </span>
          </div>
          <span className="text-brand-gold/80 hidden md:inline">|</span>
          <a href="tel:89178934001" className="font-mono hover:text-brand-gold transition flex items-center gap-1 font-bold">
            <Phone size={12} /> 8-917-893-40-01
          </a>
        </div>
      </div>

      {/* Beautiful High Contrast Header Area */}
      <header className="sticky top-0 bg-brand-dark/95 border-b border-brand-gold/15 backdrop-blur-md z-40 px-4 py-3 md:py-4 transition duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Name - Majestic Ornate Eastern Style */}
          <div className="flex items-center gap-3.5 select-none animate-fade-in">
            {/* Ornate Octagram / Islamic Star emblem cage */}
            <div className="relative w-12 h-12 flex items-center justify-center cursor-pointer group shrink-0">
              {/* Rotated outer decorative square */}
              <div className="absolute inset-0.5 border-2 border-brand-gold rounded-lg rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
              {/* Inner container */}
              <div className="absolute inset-1.5 bg-gradient-to-br from-brand-emerald to-[#0d2117] border border-brand-gold/40 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-2xl font-serif font-black text-brand-gold tracking-tight drop-shadow">Б</span>
              </div>
              <div className="absolute -top-0.5 -left-0.5 text-[8px] text-brand-gold">✦</div>
              <div className="absolute -bottom-0.5 -right-0.5 text-[8px] text-brand-gold">✦</div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-black text-3xl tracking-widest text-[#D4AF37] hover:text-amber-300 transition duration-300 uppercase drop-shadow">БИШКЕК</h1>
                <span className="text-[9px] text-brand-gold font-serif font-black border border-brand-gold/50 px-1.5 py-0.2 rounded-md bg-brand-emerald/60 uppercase tracking-widest">ХАЛЯЛЬ</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-[1px] w-3 bg-brand-gold/30"></span>
                <p className="text-[10px] text-brand-cream/65 font-serif font-semibold uppercase tracking-[0.16em] block">Восточная Чайхана</p>
                <span className="h-[1px] w-3 bg-brand-gold/30"></span>
              </div>
            </div>
          </div>

          {/* Navigational Anchor Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide">
            <button
              onClick={() => { setActiveTab("menu"); document.getElementById("main-cafe-section")?.scrollIntoView({ behavior: "smooth" }); }}
              className={`hover:text-brand-gold transition cursor-pointer pb-1 border-b-2 ${activeTab === "menu" ? "text-brand-gold border-brand-gold" : "text-brand-cream/75 border-transparent"}`}
            >
              📖 Меню & Доставка
            </button>
            <button
              onClick={() => { setActiveTab("reserve"); document.getElementById("main-cafe-section")?.scrollIntoView({ behavior: "smooth" }); }}
              className={`hover:text-brand-gold transition cursor-pointer pb-1 border-b-2 ${activeTab === "reserve" ? "text-brand-gold border-brand-gold" : "text-brand-cream/75 border-transparent"}`}
            >
              📅 Бронь Столов
            </button>
            <button
              onClick={() => { setActiveTab("order"); document.getElementById("main-cafe-section")?.scrollIntoView({ behavior: "smooth" }); }}
              className={`hover:text-brand-gold transition cursor-pointer pb-1 border-b-2 ${activeTab === "order" ? "text-brand-gold border-brand-gold" : "text-brand-cream/75 border-transparent"}`}
            >
              🚀 Мой Заказ
            </button>
            <button
              onClick={() => { setActiveTab("reviews"); document.getElementById("main-cafe-section")?.scrollIntoView({ behavior: "smooth" }); }}
              className={`hover:text-brand-gold transition cursor-pointer pb-1 border-b-2 ${activeTab === "reviews" ? "text-brand-gold border-brand-gold" : "text-brand-cream/75 border-transparent"}`}
            >
              ⭐ Отзывы ({reviews.length})
            </button>
            <a
              href="#cafe-address-map"
              className="text-brand-cream/75 hover:text-brand-gold transition flex items-center gap-1"
            >
              <MapPin size={14} className="text-brand-gold" /> Контакты
            </a>
          </nav>

          {/* Quick Stats & Cart Indicator Triggers */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCartDrawer(true)}
              id="header-cart-trigger"
              className="relative bg-brand-emerald-light hover:bg-brand-emerald border-2 border-brand-gold/40 text-brand-cream p-2.5 rounded-xl transition duration-200 flex items-center justify-center select-none shadow"
            >
              <ShoppingBag size={18} className="text-brand-gold" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-brand-dark font-sans font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cartItems.reduce((acc, c) => acc + c.quantity, 0)}
                </span>
              )}
            </button>

            {/* Support Phone Quick Dial */}
            <a
              href="tel:89178934001"
              id="header-call-cta"
              className="hidden sm:inline-flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark px-4 py-2 rounded-xl text-xs font-bold transition duration-200 shadow"
            >
              <Phone size={13} />
              <span>Позвонить</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive 3D Dish Showcase */}
      <section id="hero-showcase" className="relative bg-gradient-to-b from-[#12231b] to-brand-dark pt-12 pb-20 px-4 border-b border-brand-gold/10">
        
        {/* Majestic Centered Eastern Branding Banner - "БИШКЕК" */}
        <div className="max-w-7xl mx-auto mb-12 text-center relative z-20 animate-fade-in">
          <div className="inline-block relative px-8 py-6 md:px-16 md:py-8 text-center bg-gradient-to-b from-brand-emerald/45 via-[#0b1411]/85 to-brand-dark/95 backdrop-blur-md rounded-2xl border-2 border-brand-gold/30 shadow-2xl overflow-hidden min-w-[280px] md:min-w-[550px]">
            {/* Ambient gold glow glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_75%)]"></div>
            
            {/* Top decorative Eastern patterns and icons */}
            <div className="flex items-center justify-center gap-3 text-brand-gold mb-3">
              <span className="text-xs">✦</span>
              <span className="text-sm">❖</span>
              <span className="text-base">🕌</span>
              <span className="text-xs font-serif font-black uppercase tracking-[0.22em] text-[#D4AF37]">Кафе • Чайхана</span>
              <span className="text-base">🕌</span>
              <span className="text-sm">❖</span>
              <span className="text-xs">✦</span>
            </div>

            {/* Giant brand name БИШКЕК */}
            <h1 className="font-serif font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] uppercase select-none mr-[-0.2em]">
              БИШКЕК
            </h1>

            {/* Lower decorative dividers and badges */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-r from-transparent to-brand-gold/40"></span>
              <p className="text-[10px] sm:text-xs text-brand-cream/90 font-serif font-medium uppercase tracking-[0.35em]">
                ТРАДИЦИИ • НАЦИОНАЛЬНЫЙ ВКУС • ХАЛЯЛЬ
              </p>
              <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-l from-transparent to-brand-gold/40"></span>
            </div>

            {/* Traditional corners decorative ornaments */}
            <div className="absolute top-2.5 left-2.5 text-xs text-brand-gold/30">❖</div>
            <div className="absolute top-2.5 right-2.5 text-xs text-brand-gold/30">❖</div>
            <div className="absolute bottom-2.5 left-2.5 text-xs text-brand-gold/30">❖</div>
            <div className="absolute bottom-2.5 right-2.5 text-xs text-brand-gold/30">❖</div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text pitch and status */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 px-3.5 py-1.5 rounded-full text-xs text-brand-gold animate-pulse">
              <Star size={14} fill="currentColor" />
              <span className="font-semibold tracking-wide">Лучшая восточная кухня в городе</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-cream leading-tight">
              Вкусите легендарный <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-500">
                Халяль Плов
              </span> <br />
              и ручные манты
            </h2>

            <p className="text-brand-cream/70 text-base sm:text-lg max-w-2xl leading-relaxed">
              Добро пожаловать в гостеприимное семейное кафе «Бишкек». Перенесено подлинное кулинарное искусство Тянь-Шаня: сочная молодая баранина, ароматный рис Лазер, вытянутый вручную лагман и традиционный уют восточных топчанов.
            </p>

            {/* Quick specifications banner */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-brand-emerald-light/20 border border-brand-emerald-light/40 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-brand-gold/15 p-2 rounded-lg text-brand-gold">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="text-xs text-brand-cream/50 uppercase font-mono tracking-wider">Качество</h4>
                  <p className="text-xs font-bold font-sans">100% ХАЛЯЛЬ</p>
                </div>
              </div>

              <div className="bg-brand-emerald-light/20 border border-brand-emerald-light/40 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-brand-gold/15 p-2 rounded-lg text-brand-gold">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-xs text-brand-cream/50 uppercase font-mono tracking-wider">Каждый день</h4>
                  <p className="text-xs font-bold font-sans">09:00 - 23:00</p>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 bg-brand-emerald-light/20 border border-brand-emerald-light/40 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-brand-gold/15 p-2 rounded-lg text-brand-gold">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs text-brand-cream/50 uppercase font-mono tracking-wider">Адрес</h4>
                  <p className="text-xs font-bold font-sans truncate">Нариманова 49</p>
                </div>
              </div>
            </div>

            {/* Quick Action Drivers */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => { setActiveTab("menu"); document.getElementById("main-cafe-section")?.scrollIntoView({ behavior: "smooth" }); }}
                id="hero-order-cta"
                className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark px-7 py-4 rounded-xl text-sm font-bold tracking-wider transition duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-brand-gold/10"
              >
                ЗАКАЗАТЬ ОНЛАЙН В МЕНЮ
              </button>
              <button
                onClick={() => { setActiveTab("reserve"); document.getElementById("main-cafe-section")?.scrollIntoView({ behavior: "smooth" }); }}
                id="hero-reserve-cta"
                className="bg-brand-emerald-light hover:bg-brand-emerald text-brand-cream border border-brand-gold/30 px-6 py-4 rounded-xl text-sm font-bold tracking-wider transition duration-200"
              >
                ЗАБРОНИРОВАТЬ ТОПЧАН
              </button>
            </div>
          </div>

          {/* Interactive 3D Dish Rotator Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative bg-[#101c17] border-2 border-brand-gold/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col items-center overflow-hidden group perspective-1000">
              
              {/* Halal badge inside 3D card */}
              <div className="absolute top-3 left-3 bg-brand-gold text-brand-dark font-mono font-black text-[9px] py-0.5 px-2 rounded-full tracking-wider">
                100% ХАЛЯЛЬ
              </div>
              
              {/* Dynamic instruction text */}
              <span className="absolute top-3 right-3 text-[10px] text-brand-cream/40 font-mono tracking-wide">
                НАЖМИТЕ ДЛЯ ЛЕВИТАЦИИ
              </span>

              {/* Floor grid visual for scale */}
              <div className="absolute inset-x-0 bottom-4 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-b-2xl"></div>

              {/* Spinning Plate Container Wrapper */}
              <div
                id="3d-interactive-dish-plate"
                style={{
                  transform: `rotateX(${heroPlateTilt}deg) rotateY(${heroPlateRotation}deg)`,
                  transformStyle: "preserve-3d"
                }}
                className="w-56 h-56 my-4 select-none relative transition-all duration-300 ease-out cursor-grab active:cursor-grabbing flex items-center justify-center animate-float-slow"
              >
                
                {/* Projected gold shadow under plate */}
                <div className="absolute -bottom-2 w-44 h-8 bg-brand-gold/15 rounded-full blur-xl pointer-events-none transform -translate-y-2 translate-z-[-20px] scale-95" />

                {/* 3D Plate Background circle graphic model */}
                <div className="absolute w-44 h-44 rounded-full border-4 border-brand-gold/40 shadow-inner bg-gradient-to-br from-[#1b2b23] to-[#040806] flex items-center justify-center">
                  {/* Arabic-style vector floral ornament representing halal luxury */}
                  <div className="w-36 h-36 border border-brand-gold/20 rounded-full flex items-center justify-center relative">
                    <div className="absolute text-brand-gold/10 font-bold text-center text-[10px] uppercase font-mono tracking-widest">
                      BISHKEK CAFE
                    </div>
                  </div>
                </div>

                {/* Real Levitating Plov Food Image with 3D depth */}
                <div
                  style={{ transform: "translateZ(35px)" }}
                  className="absolute w-36 h-36 rounded-full overflow-hidden border-2 border-brand-gold/60 shadow-2xl select-none flex items-center justify-center bg-[#0d1612]"
                >
                  <img
                    src={plovFloatingImage}
                    alt="Праздничный Плов Бишкек"
                    className="w-full h-full object-cover pointer-events-none rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Secret ingredients orbiting in virtual depth */}
                <div
                  style={{ transform: "translate3d(50px, -40px, 45px)" }}
                  onMouseEnter={() => setActiveIngredient("Нежнейшая халяльная говядина фермерского убоя")}
                  onMouseLeave={() => setActiveIngredient(null)}
                  className={`absolute bg-brand-dark/95 border border-brand-gold/40 text-[10px] py-1 px-2 rounded-full cursor-pointer transition ${
                    activeIngredient ? "bg-brand-emerald text-brand-gold" : "text-brand-cream"
                  }`}
                >
                  🥩 Говядина
                </div>

                <div
                  style={{ transform: "translate3d(-60px, 40px, 50px)" }}
                  onMouseEnter={() => setActiveIngredient("Сладкая узбекская желтая морковь")}
                  onMouseLeave={() => setActiveIngredient(null)}
                  className={`absolute bg-brand-dark/95 border border-brand-gold/40 text-[10px] py-1 px-2 rounded-full cursor-pointer transition ${
                    activeIngredient ? "bg-brand-emerald text-brand-gold" : "text-brand-cream"
                  }`}
                >
                  🥕 Желтая морковь
                </div>

                <div
                  style={{ transform: "translate3d(0px, 60px, 35px)" }}
                  onMouseEnter={() => setActiveIngredient("Ароматные семена горной зиры и темный барбарис")}
                  onMouseLeave={() => setActiveIngredient(null)}
                  className={`absolute bg-brand-dark/95 border border-brand-gold/40 text-[10px] py-1 px-2 rounded-full cursor-pointer transition ${
                    activeIngredient ? "bg-brand-emerald text-brand-gold" : "text-brand-cream"
                  }`}
                >
                  🌾 Зира и барбарис
                </div>
              </div>

              {/* Informational Plate Banner */}
              <div className="text-center mt-3 z-10">
                <h4 className="font-serif text-brand-gold font-bold text-base">Плов праздничный «Бишкек»</h4>
                <p className="text-[11px] text-brand-cream/60 min-h-8 px-2">
                  {activeIngredient ? activeIngredient : "Наведите курсор на ярлыки, чтобы рассмотреть секреты вкуса."}
                </p>
                
                {/* Rotator Controls */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button
                    onClick={() => { setHeroPlateRotation((prev) => prev - 45); }}
                    id="rotate-plate-left"
                    className="w-8 h-8 rounded-full bg-brand-emerald-light hover:bg-brand-emerald border border-brand-gold/20 text-brand-gold flex items-center justify-center text-xs transition active:scale-90"
                    title="Повернуть влево"
                  >
                    ◀
                  </button>
                  <span className="text-[10px] font-mono tracking-widest text-[#d4af37]/80">ПОКРУТИТЬ 3D БЛЮДО</span>
                  <button
                    onClick={() => { setHeroPlateRotation((prev) => prev + 45); }}
                    id="rotate-plate-right"
                    className="w-8 h-8 rounded-full bg-brand-emerald-light hover:bg-brand-emerald border border-brand-gold/20 text-brand-gold flex items-center justify-center text-xs transition active:scale-90"
                    title="Повернуть вправо"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Interaction Area Tabs Menu */}
      <main id="main-cafe-section" className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 gap-8 scroll-mt-20">
        
        {/* Navigation Tabs for Medium and Small Devices */}
        <div className="flex border-b border-brand-gold/20 bg-brand-dark/50 p-1.5 rounded-xl mb-10 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("menu")}
            id="tab-menu"
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "menu"
                ? "bg-gradient-to-r from-brand-emerald to-brand-emerald-light text-brand-cream border border-brand-gold/30 shadow-md"
                : "text-brand-cream/60 hover:text-brand-cream hover:bg-white/5"
            }`}
          >
            📖 МЕНЮ И ЗАКАЗ
          </button>
          
          <button
            onClick={() => setActiveTab("reserve")}
            id="tab-reserve"
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "reserve"
                ? "bg-gradient-to-r from-brand-emerald to-brand-emerald-light text-brand-cream border border-brand-gold/30 shadow-md"
                : "text-brand-cream/60 hover:text-brand-cream hover:bg-white/5"
            }`}
          >
            📅 БРОНИРОВАНИЕ СТОЛОВ
          </button>

          <button
            onClick={() => setActiveTab("order")}
            id="tab-order"
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === "order"
                ? "bg-gradient-to-r from-brand-emerald to-brand-emerald-light text-brand-cream border border-brand-gold/30 shadow-md"
                : "text-brand-cream/60 hover:text-brand-cream hover:bg-white/5"
            }`}
          >
            🚀 СТАТУС ДОСТАВКИ
            {placedOrder && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-gold rounded-full animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            id="tab-reviews"
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "reviews"
                ? "bg-gradient-to-r from-brand-emerald to-brand-emerald-light text-brand-cream border border-brand-gold/30 shadow-md"
                : "text-brand-cream/60 hover:text-brand-cream hover:bg-white/5"
            }`}
          >
            ⭐ ОТЗЫВЫ ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Menu & Delivery system */}
        {activeTab === "menu" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Search and Category Filter Wrapper */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-emerald-light/10 border border-brand-emerald-light/30 p-5 rounded-2xl">
              
              {/* Category buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Все блюда" },
                  { id: "main", label: "🍲 Горячие блюда" },
                  { id: "dumpling", label: "🥟 Манты & Пельмени" },
                  { id: "side", label: "🍞 Закуски / Тесто" },
                  { id: "dessert", label: "🍰 Десерты & Торты" },
                  { id: "drink", label: "🍵 Напитки" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    id={`filter-category-${cat.id}`}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-brand-gold text-brand-dark"
                        : "bg-brand-dark hover:bg-brand-emerald/40 text-brand-cream/80 border border-brand-gold/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Text Search Input */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по меню..."
                  id="menu-search-input"
                  className="w-full bg-brand-dark/80 text-brand-cream text-sm placeholder-brand-cream/40 border border-brand-gold/20 hover:border-brand-gold/40 focus:border-brand-gold/80 rounded-xl py-2 pl-3 pr-10 focus:outline-none transition"
                />
                <span className="absolute right-3 top-2.5 text-brand-cream/40">🔍</span>
              </div>
            </div>

            {/* Menu Grid */}
            <div id="food-menu-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((food) => (
                  <div
                    key={food.id}
                    id={`menu-card-${food.id}`}
                    className="bg-brand-dark/90 border border-brand-emerald-light/30 rounded-2xl overflow-hidden hover:border-brand-gold/40 transition-all duration-350 flex flex-col relative group hover:shadow-xl"
                  >
                    {/* Floating popular/halal badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-black py-0.5 px-2 rounded-full tracking-wider uppercase">
                        ХАЛЯЛЬ
                      </span>
                      {food.isPopular && (
                        <span className="bg-brand-gold text-brand-dark text-[9px] font-mono font-black py-0.5 px-2 rounded-full tracking-wider uppercase">
                          ХИТ ⭐
                        </span>
                      )}
                    </div>

                    {/* Image / Graphic Visual area */}
                    <div className="h-44 bg-gradient-to-b from-[#11211a] to-brand-dark flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-radial-gradient from-brand-gold/10 to-transparent opacity-40 group-hover:scale-110 transition duration-300 z-10"></div>
                      
                      {(food.image.startsWith("http") || food.image.includes("/") || food.image.includes(".")) ? (
                        <img 
                          src={food.image} 
                          alt={food.russianName} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-7xl group-hover:scale-110 transition duration-300 select-none transform drop-shadow-lg">
                          {food.image}
                        </span>
                      )}
                      
                      <div className="absolute bottom-3 right-3 bg-brand-dark/90 border border-brand-gold/30 rounded-lg px-2.5 py-1 text-sm font-bold text-brand-gold font-mono z-20">
                        {food.price} ₽
                      </div>
                    </div>

                    {/* Menu details content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-serif text-lg text-brand-cream font-bold group-hover:text-brand-gold transition">
                          {food.russianName}
                        </h4>
                        <p className="text-xs text-brand-cream/65 leading-relaxed mt-2 line-clamp-3">
                          {food.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-brand-gold/10 flex items-center justify-between gap-2">
                        {/* Status detail */}
                        <div className="flex items-center gap-1 text-[10px] text-brand-cream/45 font-mono">
                          <CheckCircle2 size={11} className="text-emerald-500" />
                          <span>В наличии</span>
                        </div>

                        {/* Add to order cart CTA button */}
                        <button
                          onClick={() => addToCart(food)}
                          id={`add-to-cart-btn-${food.id}`}
                          className="bg-brand-emerald-light hover:bg-brand-gold hover:text-brand-dark text-brand-cream px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer flex items-center gap-1"
                        >
                          <span>+ В Корзину</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-3 text-center py-12 bg-black/20 rounded-2xl border border-brand-gold/10">
                  <span className="text-4xl block mb-2">🍽️</span>
                  <p className="text-brand-cream/65">По вашему запросу ничего не найдено.</p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                    className="text-brand-gold text-xs underline font-mono mt-2 cursor-pointer"
                  >
                    Показать всё меню
                  </button>
                </div>
              )}
            </div>

            {/* Quality Promise layout */}
            <div className="bg-gradient-to-r from-brand-emerald to-[#0c1813] border border-brand-gold/20 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🥘</span>
                <div>
                  <h4 className="font-serif text-brand-gold font-bold text-lg">Высочайшее качество Халяль</h4>
                  <p className="text-xs text-brand-cream/70 max-w-xl">
                    Мы готовим исключительно из сертифицированного свежего халяль мяса. Вся лапша для лагмана и тесто для мант раскатываются вручную нашими поварами ежедневно.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setActiveTab("reserve"); }}
                className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider transition shrink-0 uppercase"
              >
                Забронировать столик
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Reservation & Interactive seating layout */}
        {activeTab === "reserve" && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="text-center max-w-xl mx-auto space-y-2 mb-4">
              <h3 className="font-serif text-3xl text-brand-cream">Онлайн-резервирование столов</h3>
              <p className="text-sm text-brand-cream/70">
                Заполните форму ниже и выберите номер столика на интерактивной 3D-схеме зала
              </p>
            </div>

            {/* Complete Reservation Flex Layout Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Interactive 3D Seating Map Layout (taking 7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <Interactive3DMap
                  selectedTableId={bookingFormData.tableId}
                  onSelectTable={(tableId) => {
                    setBookingFormData((prev) => ({ ...prev, tableId }));
                  }}
                  bookedTableIds={getBookedTableIds()}
                />
                
                {/* Tables features explanation */}
                <div className="bg-[#111916] border border-[#d4af37]/10 p-4 rounded-xl text-xs space-y-2">
                  <p className="font-bold text-brand-gold flex items-center gap-1">
                    <Info size={13} /> Тонкости расположения столов:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-brand-cream/70 font-sans pl-1">
                    <li>Столики <strong className="text-brand-cream font-mono">1 и 2</strong> подходят для приятных свиданий на двоих (до 2 персон).</li>
                    <li>Центральные столы <strong className="text-brand-cream font-mono">3 и 4</strong> идеальны для семейного ужина (до 4-5 гостей).</li>
                    <li>Столы <strong className="text-brand-cream font-mono">5 и 6</strong> представляют собой аутентичные <span className="text-brand-gold font-bold">VIP-Топчаны</span> с традиционными коврами и валиками (до 8-10 гостей). Отлично подходят для больших компаний!</li>
                  </ul>
                </div>
              </div>

              {/* Form elements (taking 5 cols) */}
              <div className="lg:col-span-5 bg-[#121c18] border border-brand-gold/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                
                {/* Decorative Crescent design element in panel background */}
                <div className="absolute -top-12 -right-12 text-9xl text-brand-gold/5 pointer-events-none font-serif">
                  🌙
                </div>

                {bookingSuccessTicket ? (
                  // Reservation ticket display on success
                  <div id="booking-success-ticket" className="text-center py-6 space-y-5 animate-fade-in">
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full border border-brand-gold text-brand-gold flex items-center justify-center mx-auto text-3xl animate-bounce">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-serif text-2xl text-brand-gold font-bold">Бронь подтверждена!</h4>
                      <p className="text-xs text-brand-cream/60 mt-1">Ожидаем вас в халяль кафе «Бишкек»</p>
                    </div>

                    <div className="bg-[#192621] p-4 rounded-xl border border-brand-gold/10 text-left font-mono text-xs space-y-2 relative">
                      {/* Ticket cutouts */}
                      <div className="absolute top-1/2 -left-2.5 w-5 h-5 rounded-full bg-[#121c18]"></div>
                      <div className="absolute top-1/2 -right-2.5 w-5 h-5 rounded-full bg-[#121c18]"></div>
                      
                      <div className="flex justify-between border-b border-brand-gold/10 pb-2">
                        <span className="text-brand-cream/50">Имя гостя:</span>
                        <span className="font-bold text-brand-cream">{bookingSuccessTicket.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-cream/50">Телефон:</span>
                        <span className="font-bold text-brand-cream">{bookingSuccessTicket.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-cream/50">Дата & Время:</span>
                        <span className="font-bold text-brand-cream">{bookingSuccessTicket.date} в {bookingSuccessTicket.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-cream/50">Количество гостей:</span>
                        <span className="font-bold text-brand-cream">{bookingSuccessTicket.guests} перс.</span>
                      </div>
                      <div className="flex justify-between border-t border-brand-gold/10 pt-2 text-brand-gold font-bold">
                        <span>СТОЛИК №:</span>
                        <span>{bookingSuccessTicket.tableId} ({
                          TABLES.find((t) => t.id === bookingSuccessTicket.tableId)?.type === "topchan" ? "Хан-Топчан" : "Уютная зона"
                        })</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-brand-cream/50">
                      Адрес: ул. Нариманова 49. Наш номер телефона: 8-917-893-40-01. Код бронирования: <strong className="text-brand-cream font-mono">BK-{(bookingSuccessTicket.id || "64").toUpperCase()}</strong>.
                    </div>

                    <button
                      onClick={() => setBookingSuccessTicket(null)}
                      className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-dark py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide transition uppercase cursor-pointer"
                    >
                      ЗАБРОНИРОВАТЬ ЕЩЕ ОДИН СТОЛ
                    </button>
                  </div>
                ) : (
                  // Reservation input Form
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <h4 className="font-serif text-xl border-b border-brand-gold/10 pb-2 text-brand-gold font-semibold">
                      Детали Бронирования
                    </h4>

                    {/* Date Input */}
                    <div>
                      <label className="text-xs uppercase tracking-wider text-brand-cream/50 font-mono block mb-1">
                        Выберите Дату *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={bookingFormData.date}
                          onChange={(e) => setBookingFormData((p) => ({ ...p, date: e.target.value }))}
                          required
                          className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-brand-gold"
                        />
                      </div>
                    </div>

                    {/* Timeslots & Guests Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-brand-cream/50 font-mono block mb-1">
                          Время заезда *
                        </label>
                        <select
                          value={bookingFormData.time}
                          onChange={(e) => setBookingFormData((p) => ({ ...p, time: e.target.value }))}
                          className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-brand-cream"
                        >
                          <option value="09:00">09:00</option>
                          <option value="11:00">11:00</option>
                          <option value="13:00">13:00</option>
                          <option value="15:00">15:00</option>
                          <option value="17:00">17:00</option>
                          <option value="18:00">18:00</option>
                          <option value="19:00">19:00</option>
                          <option value="20:00">20:00</option>
                          <option value="21:00">21:00</option>
                          <option value="22:00">22:00</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-wider text-brand-cream/50 font-mono block mb-1">
                          Гости (персон) *
                        </label>
                        <select
                          value={bookingFormData.guests}
                          onChange={(e) => setBookingFormData((p) => ({ ...p, guests: Number(e.target.value) }))}
                          className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-brand-cream"
                        >
                          <option value="1">1 персона</option>
                          <option value="2">2 персоны</option>
                          <option value="3">3 персоны</option>
                          <option value="4">4 персоны</option>
                          <option value="6">6 персон</option>
                          <option value="8">До 8 персон</option>
                          <option value="10">Более 10</option>
                        </select>
                      </div>
                    </div>

                    {/* Table ID visual selector (linked with 3D map) */}
                    <div>
                      <label className="text-xs uppercase tracking-wider text-brand-cream/50 font-mono block mb-1">
                        Выбранный Стол *
                      </label>
                      <select
                        value={bookingFormData.tableId}
                        onChange={(e) => setBookingFormData((p) => ({ ...p, tableId: Number(e.target.value) }))}
                        className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-brand-cream font-bold"
                      >
                        {TABLES.map((table) => {
                          const isBooked = getBookedTableIds().includes(table.id);
                          return (
                            <option key={table.id} value={table.id} disabled={isBooked}>
                              Столик №{table.id} — {table.name} ({table.capacity} мест){isBooked ? " [ЗАНЯТ]" : ""}
                            </option>
                          );
                        })}
                      </select>
                      <p className="text-[10px] text-brand-gold/80 font-mono mt-1">
                        ✦ Для смены стола вы также можете просто кликнуть по нему на 3D карте слева!
                      </p>
                    </div>

                    {/* Guest Name & contact phone */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-brand-cream/50 font-mono block mb-1">
                          Данное имя *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Алибек Аскаров"
                          value={bookingFormData.name}
                          onChange={(e) => setBookingFormData((p) => ({ ...p, name: e.target.value }))}
                          className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-brand-gold"
                        />
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-wider text-brand-cream/50 font-mono block mb-1">
                          Контактный телефон *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+7 (999) 111-22-33"
                          value={bookingFormData.phone}
                          onChange={(e) => setBookingFormData((p) => ({ ...p, phone: e.target.value }))}
                          className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-brand-gold"
                        />
                      </div>
                    </div>

                    {/* Safety Halal note */}
                    <div className="p-3 bg-brand-emerald-light/10 border border-brand-emerald/30 rounded-xl text-[10px] text-brand-cream/60 flex gap-2">
                      <span>🕌</span>
                      <p>
                        Пожалуйста, обратите внимание: в нашем кафе запрещен алкоголь. Все блюда соответствуют стандартам Халяль. Просим соблюдать традиции взаимоуважения.
                      </p>
                    </div>

                    {/* Submit block */}
                    <button
                      type="submit"
                      id="submit-reservation-form-btn"
                      className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-dark py-3 rounded-xl text-xs font-bold tracking-widest transition uppercase cursor-pointer shadow-lg"
                    >
                      ПОДТВЕРДИТЬ РЕЗЕРВ СТОЛА
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Detailed Live Delivery / Order Status timeline */}
        {activeTab === "order" && (
          <div className="space-y-8 max-w-3xl mx-auto animate-fade-in">
            {placedOrder ? (
              <div className="bg-[#121c18] border border-brand-gold/20 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* Visual Order header tracker status */}
                <div className="border-b border-brand-gold/15 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] bg-brand-gold/15 text-brand-gold border border-brand-gold/30 rounded-full px-3 py-1 font-mono uppercase tracking-wider">
                      Заказ успешно оформлен
                    </span>
                    <h4 className="font-serif text-2xl text-brand-cream font-bold mt-2">
                      Отслеживание Заказа #{placedOrder.id}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-brand-cream/50 uppercase font-mono tracking-wider">Всего к оплате при получении</p>
                    <p className="text-xl font-bold font-mono text-brand-gold">{placedOrder.totalPrice} ₽</p>
                  </div>
                </div>

                {/* Progress Visual Timeline Tracker */}
                <div id="order-delivery-timeline" className="relative py-8">
                  {/* Linear background connector path string */}
                  <div className="absolute top-[3.7rem] left-8 right-8 h-1 bg-emerald-950 -z-0"></div>
                  
                  {/* Active highlight background connector path */}
                  <div
                    style={{ width: `${(orderStep - 1) * 33}%` }}
                    className="absolute top-[3.7rem] left-8 h-1 bg-brand-gold transition-all duration-1000 -z-0"
                  ></div>

                  {/* 4 Steps timeline cards */}
                  <div className="grid grid-cols-4 gap-2 relative z-10 select-none">
                    
                    {/* Step 1: Placed */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs transition duration-300 ${
                        orderStep >= 1 ? "bg-brand-gold border-brand-gold text-brand-dark" : "bg-brand-dark border-emerald-950 text-brand-cream/40"
                      }`}>
                        🏮
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold block">Принят</span>
                      <span className="text-[9px] text-brand-cream/40 hidden sm:block">Повар изучает меню</span>
                    </div>

                    {/* Step 2: Cooking */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs transition duration-300 ${
                        orderStep >= 2 ? "bg-brand-gold border-brand-gold text-brand-dark" : "bg-brand-dark border-emerald-950 text-brand-cream/40"
                      }`}>
                        🔥
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold block">Готовится</span>
                      <span className="text-[9px] text-brand-cream/40 hidden sm:block">Томится плов на саксауле</span>
                    </div>

                    {/* Step 3: Out for delivery / Courier */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs transition duration-300 ${
                        orderStep >= 3 ? "bg-brand-gold border-brand-gold text-brand-dark" : "bg-brand-dark border-emerald-950 text-brand-cream/40"
                      }`}>
                        🚴
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold block">Доставка</span>
                      <span className="text-[9px] text-brand-cream/40 hidden sm:block">Курьер мчится на адрес</span>
                    </div>

                    {/* Step 4: Complete */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs transition duration-300 ${
                        orderStep >= 4 ? "bg-emerald-600 border-emerald-500 text-brand-cream" : "bg-brand-dark border-emerald-950 text-brand-cream/40"
                      }`}>
                        ✓
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold block">Прибыл</span>
                      <span className="text-[9px] text-brand-cream/40 hidden sm:block">Приятного аппетита!</span>
                    </div>

                  </div>
                </div>

                {/* Sub-status detailed card info */}
                <div className="bg-[#192621]/80 p-4 border border-[#d4af37]/15 rounded-xl text-xs space-y-2.5">
                  <div className="flex justify-between font-mono">
                    <span className="text-brand-cream/55">Получатель:</span>
                    <span className="font-bold">{placedOrder.customerName} ({placedOrder.phone})</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-brand-cream/55">Адрес доставки:</span>
                    <span className="font-bold text-right max-w-sm">{placedOrder.address}</span>
                  </div>
                  <div className="border-t border-brand-gold/10 pt-2 flex flex-col space-y-1">
                    <span className="text-brand-cream/55 font-mono">Состав блюд:</span>
                    {placedOrder.items && placedOrder.items.map((it: any, index: number) => (
                      <div key={index} className="flex justify-between text-[11px] font-mono">
                        <span className="text-brand-gold">✓ {it.name} x{it.quantity}</span>
                        <span>{it.price * it.quantity} ₽</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => { setActiveTab("menu"); }}
                    className="flex-1 bg-brand-emerald text-brand-cream border border-brand-gold/20 py-2.5 rounded-xl text-xs font-bold tracking-wide hover:bg-brand-emerald-light transition uppercase cursor-pointer"
                  >
                    Вернуться к меню
                  </button>
                  <button
                    onClick={() => { setPlacedOrder(null); setOrderStep(0); }}
                    className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark py-2.5 rounded-xl text-xs font-bold tracking-wide transition uppercase cursor-pointer"
                  >
                    Оформить новый заказ
                  </button>
                </div>

              </div>
            ) : (
              // Empty/Instructional view
              <div className="text-center py-12 bg-black/20 border border-brand-gold/15 rounded-2xl p-8 space-y-4">
                <span className="text-5xl block animate-bounce">🚴</span>
                <h4 className="font-serif text-xl font-bold text-brand-gold">У вас пока нет активных заказов</h4>
                <p className="text-xs text-brand-cream/65 max-w-sm mx-auto leading-relaxed">
                  Перейдите во вкладку меню, положите вкуснейшие горячие халяль блюда в корзину и оформите быструю адресную доставку за пару шагов!
                </p>
                <button
                  onClick={() => setActiveTab("menu")}
                  className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark font-mono text-xs font-bold py-2.5 px-6 rounded-lg uppercase transition cursor-pointer"
                >
                  ПЕРЕЙТИ К ВЫБОРУ БЛЮД
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Reviews & feedback section */}
        {activeTab === "reviews" && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Form to submit review input */}
              <div className="md:col-span-5 bg-[#121c18] border border-brand-gold/20 rounded-2xl p-6 shadow-xl relative">
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h4 className="font-serif text-xl border-b border-brand-gold/15 pb-2 text-brand-gold font-bold">
                    Оставить Ваш Отзыв
                  </h4>

                  {/* Success notification overlay */}
                  {reviewSuccessMsg && (
                    <div className="bg-emerald-950 border border-emerald-500 text-emerald-400 p-3 rounded-lg text-xs font-semibold animate-fade-in">
                      {reviewSuccessMsg}
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-brand-cream/50 font-mono block mb-1">
                      Ваша оценка *
                    </label>
                    <div className="flex gap-2 text-2xl">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          id={`rating-star-selector-${val}`}
                          onClick={() => setReviewFormData((prev) => ({ ...prev, rating: val }))}
                          className="hover:scale-125 transition active:scale-90"
                        >
                          <Star
                            size={24}
                            className={val <= reviewFormData.rating ? "text-brand-gold font-bold" : "text-brand-cream/20"}
                            fill={val <= reviewFormData.rating ? "#D4AF37" : "none"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-brand-cream/50 font-mono block mb-1">
                      Как к вам обращаться *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Канатбек"
                      value={reviewFormData.name}
                      onChange={(e) => setReviewFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  {/* Comment box */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-brand-cream/50 font-mono block mb-1">
                      Ваш честный отзыв *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Поделитесь впечатлениями о нашем плове, уровне обслуживания или уютном топчане..."
                      value={reviewFormData.comment}
                      onChange={(e) => setReviewFormData((prev) => ({ ...prev, comment: e.target.value }))}
                      className="w-[#100%] bg-[#18231f] border border-brand-gold/20 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-brand-gold leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    id="submit-review-form-btn"
                    className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-dark py-3 rounded-xl text-xs font-bold tracking-widest transition uppercase cursor-pointer"
                  >
                    ОТПРАВИТЬ ОТЗЫВ
                  </button>
                </form>
              </div>

              {/* Reviews Feed display */}
              <div className="md:col-span-7 space-y-4">
                <h4 className="font-serif text-xl border-b border-brand-gold/15 pb-2 text-brand-cream font-semibold">
                  Мнения Любимых Гостей
                </h4>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        id={`review-item-${rev.id}`}
                        className="bg-[#121c18]/80 border border-brand-emerald-light/30 rounded-xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-brand-gold/20 flex items-center justify-center text-sm font-bold text-brand-gold">
                              {rev.name.charAt(0)}
                            </div>
                            <div>
                              <h5 className="font-bold text-brand-cream text-xs">{rev.name}</h5>
                              <p className="text-[10px] text-brand-cream/40 font-mono">{rev.date}</p>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < (rev.rating || 5) ? "text-brand-gold" : "text-brand-cream/10"}
                                fill={i < (rev.rating || 5) ? "#D4AF37" : "none"}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-brand-cream/80 leading-relaxed pl-1 italic">
                          «{rev.comment}»
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-brand-cream/50 text-center py-6">Загрузка отзывов...</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 2GIS Map Location & Route Integration Section */}
      <section id="cafe-address-map" className="bg-[#0b120f] py-16 border-t border-brand-gold/10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Map Left description details */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] bg-brand-gold/15 text-brand-gold border border-brand-gold/30 rounded-full px-3 py-1 font-mono uppercase tracking-wider">
              Где нас найти
            </span>

            <h3 className="font-serif text-3xl sm:text-4xl text-brand-cream font-bold">
              Ждем вас на ул. Нариманова 49
            </h3>

            <p className="text-xs sm:text-sm text-brand-cream/70 leading-relaxed">
              Мы расположены в центральном и легкодоступном районе города. Рядом с кафе предусмотрена просторная бесплатная парковка для наших клиентов. Внутри оборудованы залы и обособленные топчан-кабины для индивидуальных встреч.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-brand-gold/30 flex items-center justify-center text-brand-gold text-sm">📍</span>
                <div>
                  <h5 className="text-[10px] text-brand-cream/40 uppercase font-mono tracking-wider">Адрес</h5>
                  <p className="text-xs font-bold">г. Казань, ул. Нариманова, д. 49</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-brand-gold/30 flex items-center justify-center text-brand-gold text-sm">⏰</span>
                <div>
                  <h5 className="text-[10px] text-brand-cream/40 uppercase font-mono tracking-wider">Часы работы</h5>
                  <p className="text-xs font-bold">Ежедневно: с 09:00 до 23:00</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-brand-gold/30 flex items-center justify-center text-brand-gold text-sm">📞</span>
                <div>
                  <h5 className="text-[10px] text-brand-cream/40 uppercase font-mono tracking-wider">Контакты</h5>
                  <p className="text-xs font-bold">8-917-893-40-01 (Бронь столов / Доставка)</p>
                </div>
              </div>
            </div>

            {/* Visual Route calculator / Estimated travel times simulation split */}
            <div className="bg-[#121c18] border border-brand-gold/15 p-4 rounded-xl space-y-2">
              <h5 className="text-xs text-brand-gold font-mono font-bold uppercase tracking-wider">Примерное время в пути:</h5>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <p className="text-brand-cream/50">🚗 На авто:</p>
                  <p className="text-brand-cream font-bold">~10-15 минут из центра</p>
                </div>
                <div>
                  <p className="text-brand-cream/50">🏃 Пешком:</p>
                  <p className="text-brand-cream font-bold">~5 минут от остановок</p>
                </div>
              </div>
            </div>

            {/* Direct 2GIS trigger mapping CTAs */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://2gis.ru/astrakhan/search/%D1%83%D0%BB.%20%D0%BD%D0%B0%D1%80%D0%B8%D0%BC%D0%B0%D0%BD%D0%BE%D0%B2%D0%B0%2049"
                target="_blank"
                rel="noreferrer"
                id="2gis-map-link"
                className="bg-[#2a875a] hover:bg-[#1a6640] text-white px-5 py-3 rounded-xl text-xs font-bold font-mono tracking-wider transition uppercase flex items-center gap-1.5 shadow"
              >
                <span>🗺️ ОТКРЫТЬ В 2ГИС</span>
              </a>

              <a
                href="https://yandex.ru/maps/?text=%D1%83%D0%BB.+%D0%9D%D0%B0%D1%80%D0%B8%D0%BC%D0%B0%D0%BD%D0%BE%D0%B2%D0%B0+49%2C+%D0%90%D1%81%D1%82%D1%80%D0%B0%D1%85%D0%B0%D0%BD%D1%8C"
                target="_blank"
                rel="noreferrer"
                id="yandex-map-link"
                className="bg-brand-emerald-light hover:bg-[#13402b] text-brand-cream border border-brand-gold/20 px-4 py-3 rounded-xl text-xs font-bold font-mono tracking-wider transition uppercase flex items-center gap-1.5"
              >
                <span>ЯНДЕКС.КАРТЫ</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Visual Mockup using actual styled coordinate visual details */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-brand-gold/30 shadow-2xl h-[340px] bg-gradient-to-br from-[#101010] to-[#1a1a1a]">
              
              {/* Virtual Grid map with street names layout simulation */}
              <div className="absolute inset-0 bg-[#0f1713] opacity-80" />
              
              {/* Fake visually beautiful digital map roads for design depth */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <div className="absolute top-[40%] text-[10px] font-mono tracking-widest text-brand-gold rotate-6">ул. Свердлова</div>
                <div className="absolute bottom-[20%] text-[10px] font-mono tracking-widest text-brand-gold -rotate-12">ул. Победы</div>
                {/* Roads lines */}
                <div className="absolute h-0.5 bg-brand-gold/30 left-0 right-0 top-[20%]"></div>
                <div className="absolute h-0.5 bg-brand-gold/30 left-0 right-0 bottom-[35%]"></div>
                <div className="absolute w-0.5 bg-brand-gold/30 top-0 bottom-0 left-[30%] rotate-12"></div>
                <div className="absolute w-0.5 bg-brand-gold/30 top-0 bottom-0 right-[25%] -rotate-6"></div>
              </div>

              {/* Exact Center Point marker with glowing rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                
                {/* Glower wave links */}
                <span className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/50 animate-ping absolute -z-0"></span>

                <div className="bg-brand-dark border-2 border-brand-gold rounded-full w-12 h-12 flex items-center justify-center relative z-10 shadow-lg cursor-pointer transform hover:scale-110 transition duration-300">
                  <span className="text-xl">🕌</span>
                </div>

                <div className="mt-1 bg-brand-dark/95 border border-brand-gold/40 text-brand-cream/90 text-[10px] font-mono py-1 px-2 rounded-lg text-center font-bold relative z-10 shadow-md">
                  КАФЕ «БИШКЕК»
                  <span className="block text-[8px] text-brand-gold font-normal">ул. Нариманова 49</span>
                </div>
              </div>

              {/* Compass overlay graphic */}
              <div className="absolute top-3 right-3 text-brand-gold/30 font-serif text-2xl select-none">
                ✦ N
              </div>

              {/* Interactive Info overlay button */}
              <div className="absolute bottom-4 left-4 bg-brand-dark/95 border border-brand-gold/20 p-3 rounded-xl max-w-xs text-[11px] backdrop-blur-sm shadow">
                <p className="font-bold text-brand-gold flex items-center gap-1 mb-0.5">
                  <span>🗺️</span> 2ГИС Интеграция
                </p>
                <p className="text-brand-cream/70 leading-normal">
                  Кликом по кнопке слева вы можете построить кратчайший пеший или автомобильный маршрут прямо до дверей кафе!
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Slide-out Sidebar Shopping Cart Drawer */}
      {showCartDrawer && (
        <div id="shopping-cart-drawer" className="fixed inset-0 bg-black/75 z-50 backdrop-blur-sm flex justify-end animate-fade-in font-sans">
          
          {/* Close trigger background area */}
          <div className="flex-1" onClick={() => setShowCartDrawer(false)} />

          {/* Drawer content body */}
          <div className="w-full max-w-md bg-[#111915]/95 border-l-2 border-brand-gold/30 h-full shadow-2xl flex flex-col justify-between overflow-hidden relative">
            
            {/* Header */}
            <div className="p-4 bg-brand-emerald border-b border-brand-gold/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <h4 className="font-serif text-brand-cream font-bold text-base">Корзина заказа</h4>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="text-brand-cream/60 hover:text-brand-cream bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Cart list body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length > 0 ? (
                <>
                  {/* Delivery notification tracker badge */}
                  <div className="bg-brand-[#1a2d24]/60 border border-brand-gold/10 rounded-xl p-3 text-xs text-brand-cream/80 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-brand-gold">
                        {getSubtotal() >= 1000 ? "✓ Бесплатная доставка!" : "До бесплатной доставки нужно:"}
                      </p>
                      {getSubtotal() < 1000 && (
                        <p className="text-[10px] text-brand-cream/55 mt-0.5">
                          Добавьте блюд еще на <strong className="text-brand-gold">{1000 - getSubtotal()} ₽</strong>
                        </p>
                      )}
                    </div>
                    <span className="text-xl">{getSubtotal() >= 1000 ? "🎁" : "🚗"}</span>
                  </div>

                  {/* List of items */}
                  <div className="space-y-3">
                    {cartItems.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="bg-[#18231f] border border-brand-gold/10 p-3 rounded-xl flex items-center gap-3 justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {(item.image.startsWith("http") || item.image.includes("/") || item.image.includes(".")) ? (
                            <img
                              src={item.image}
                              alt={item.russianName}
                              className="w-10 h-10 rounded-lg object-cover border border-brand-gold/20 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-3xl select-none flex-shrink-0">{item.image}</span>
                          )}
                          <div>
                            <h5 className="font-bold text-brand-cream text-xs">{item.russianName}</h5>
                            <p className="font-mono text-brand-gold text-[11px] font-semibold">{item.price} ₽</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quantity control updates */}
                          <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-lg border border-brand-gold/10 text-xs">
                            <button
                              onClick={() => updateCartQty(item.id, false)}
                              className="text-brand-cream/60 hover:text-brand-gold transition"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-brand-cream">{quantity}</span>
                            <button
                              onClick={() => updateCartQty(item.id, true)}
                              className="text-brand-cream/60 hover:text-brand-gold transition"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1 rounded transition"
                            title="Удалить"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing brief layout details */}
                  <div className="border-t border-brand-gold/10 pt-4 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-brand-cream/50">Подитог:</span>
                      <span>{getSubtotal()} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-cream/50">Адресная Доставка:</span>
                      <span>{getDeliveryCost() === 0 ? "БЕСПЛАТНО" : `${getDeliveryCost()} ₽`}</span>
                    </div>
                    <div className="flex justify-between border-t border-brand-gold/10 pt-2 text-brand-gold text-sm font-bold">
                      <span>ИТОГО К ОПЛАТЕ:</span>
                      <span>{getTotal()} ₽</span>
                    </div>
                  </div>

                  {/* Ordering Details Form block */}
                  <form onSubmit={handleOrderSubmit} className="space-y-3 pt-4 border-t border-brand-gold/10">
                    <h5 className="font-serif font-bold text-brand-gold text-xs uppercase tracking-wider mb-2">Адресные реквизиты доставки</h5>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-brand-cream/40 block mb-1">ФИО Получателя *</label>
                      <input
                        type="text"
                        required
                        placeholder="Руслан К."
                        value={orderFormData.name}
                        onChange={(e) => setOrderFormData((p) => ({ ...p, name: e.target.value }))}
                        className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-brand-cream"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-brand-cream/40 block mb-1">Номер Телефона *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+7 (911) 222-33-44"
                        value={orderFormData.phone}
                        onChange={(e) => setOrderFormData((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-brand-cream"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-brand-cream/40 block mb-1">Точный адрес (улица, дом, кв) *</label>
                      <input
                        type="text"
                        required
                        placeholder="ул. Ленина, д. 22, кв. 73"
                        value={orderFormData.address}
                        onChange={(e) => setOrderFormData((p) => ({ ...p, address: e.target.value }))}
                        className="w-full bg-[#18231f] border border-brand-gold/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-brand-cream"
                      />
                    </div>

                    <button
                      type="submit"
                      id="submit-checkout-order-btn"
                      className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-dark font-mono font-bold py-3 rounded-xl text-xs uppercase tracking-wide transition duration-150 cursor-pointer shadow-lg mt-2"
                    >
                      ОФОРМИТЬ ДОСТАВКУ НА ДОМ
                    </button>
                    <p className="text-[10px] text-center text-brand-cream/40">
                      ✦ Самовывоз осуществляется по адресу: ул. Нариманова 49.
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <span className="text-5xl block">🛒</span>
                  <p className="text-brand-cream/50 text-xs">Ваша корзина заказа пока совершенно пуста.</p>
                  <button
                    onClick={() => setShowCartDrawer(false)}
                    className="text-brand-gold hover:underline text-xs"
                  >
                    Вернуться к меню
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Conversational AI Chat Bot Widget overlay */}
      <Chatbot />

      {/* Cozy Visual Footer */}
      <footer className="bg-brand-dark border-t border-brand-gold/15 py-12 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-emerald border border-brand-gold flex items-center justify-center font-bold text-brand-gold text-sm font-serif">
              Б
            </div>
            <div>
              <p className="font-serif font-black text-brand-cream text-sm uppercase tracking-wide">Кафе «Бишкек»</p>
              <p className="text-[10px] text-brand-cream/50 uppercase tracking-widest font-mono">100% Халяль Кухня</p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="text-brand-cream/50">г. Казань, улица Нариманова, д. 49</p>
            <p className="text-brand-cream/30">© 2026 Халяль кафе «Бишкек» • Все права защищены.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
