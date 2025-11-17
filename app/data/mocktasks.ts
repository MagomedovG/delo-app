type PriceType = "fixed" | "hourly";
type Status = "open" | "in_progress" | "completed";
export interface Task {
    id: string;
    title: string;
    description: string;
    price: number;
    priceType: PriceType;
    deadline: string;
    location: string;
    offersCount: number;
    status: Status;
    postedDate: string;
    category: string;
    image:string[];
  }
  
  export const mockTasks: Task[] = [
    {
      id: "1",
      title: "Сборка мебели IKEA",
      description: "Нужно собрать шкаф-купе и две тумбочки. Все инструменты есть.",
      price: 3000,
      priceType: "fixed",
      deadline: "2025-10-25",
      location: "Москва, Чертаново",
      offersCount: 12,
      status: "open",
      postedDate: "2025-10-19",
      category: "repair",
      images:['https://sp-koigorodok.ru/media/project_mo_342/54/7c/ea/dc/69/f1/5483e331a9bace540b3a2478fc014e25_xl.jpg'],
    },
    {
      id: "2",
      title: "Доставка документов",
      description: "Забрать документы из офиса и доставить в другой район.",
      price: 500,
      priceType: "fixed",
      deadline: "2025-10-20",
      location: "Москва, Центр",
      offersCount: 8,
      status: "open",
      postedDate: "2025-10-19",
      category: "delivery",
      images:['https://sp-koigorodok.ru/media/project_mo_342/54/7c/ea/dc/69/f1/5483e331a9bace540b3a2478fc014e25_xl.jpg'],
    },
    {
      id: "3",
      title: "Репетитор по математике",
      description: "Подготовка к ЕГЭ, требуется 2 занятия в неделю.",
      price: 1500,
      priceType: "hourly",
      deadline: "2025-11-01",
      location: "Москва, Тверская",
      offersCount: 5,
      status: "open",
      postedDate: "2025-10-18",
      category: "education",
      images:['https://sp-koigorodok.ru/media/project_mo_342/54/7c/ea/dc/69/f1/5483e331a9bace540b3a2478fc014e25_xl.jpg'],
    },
    {
      id: "4",
      title: "Уборка квартиры",
      description: "Генеральная уборка двухкомнатной квартиры. Все средства предоставлю.",
      price: 2500,
      priceType: "fixed",
      deadline: "2025-10-22",
      location: "Москва, Крылатское",
      offersCount: 15,
      status: "in_progress",
      postedDate: "2025-10-17",
      category: "cleaning",
      images:['https://sp-koigorodok.ru/media/project_mo_342/54/7c/ea/dc/69/f1/5483e331a9bace540b3a2478fc014e25_xl.jpg'],
    },
    {
      id: "5",
      title: "Разработка логотипа",
      description: "Нужен логотип для стартапа в сфере технологий.",
      price: 8000,
      priceType: "fixed",
      deadline: "2025-10-30",
      location: "Удаленно",
      offersCount: 23,
      status: "open",
      postedDate: "2025-10-19",
      category: "media",
      images:['https://sp-koigorodok.ru/media/project_mo_342/54/7c/ea/dc/69/f1/5483e331a9bace540b3a2478fc014e25_xl.jpg'],
    },
    {
      id: "6",
      title: "Настройка компьютера",
      description: "Установка программ, настройка системы, удаление вирусов.",
      price: 1200,
      priceType: "hourly",
      deadline: "2025-10-21",
      location: "Москва, Выхино",
      offersCount: 7,
      status: "open",
      postedDate: "2025-10-18",
      category: "it",
      images:['https://sp-koigorodok.ru/media/project_mo_342/54/7c/ea/dc/69/f1/5483e331a9bace540b3a2478fc014e25_xl.jpg'],
    },
  ];