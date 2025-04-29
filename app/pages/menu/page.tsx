"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/header";
import css from "./menu.module.css";
import menuData from "./database.js"; // Импорт данных из database.js

// Интерфейс для категории
interface Category {
	icon: string;
	name: string;
	description: string;
}

// Интерфейс для элемента меню
interface MenuItem {
	name: string;
	price: string; // Формат: "119 Р"
	image: string;
	description: string;
	weight?: string; // Опционально, так как отсутствует в database.js
	category: Category;
	articul: number; // Из database.js
	sizes?: { [key: string]: number }[]; // Опционально, для размеров
}

// Преобразование данных из database.js в формат, подходящий для компонента
const transformMenuItems = (data: any[]): MenuItem[] => {
	// Маппинг изображений по категориям для заглушек
	const imageMap: { [key: string]: string } = {
		Кофе: "/coffee.jfif",
		Чай: "/tea.jfif",
		"Прохладительные напитки": "/lemonade.jpg",
		Выпечка: "/bakery.jpg",
		"Основные блюда": "/food.jpg",
		Другое: "/other.jpg",
	};

	return data.map((item) => ({
		name: item.name,
		price: `${item.price} Р`,
		image: imageMap[item.category.name] || "/default.jfif", // Заглушка для изображений
		description: item.description || `Состав: ${item.name.toLowerCase()}.`, // Если описание пустое
		category: {
			icon: "/icons/coffee.png", // Оставляем текущую иконку как заглушку
			name: item.category.name,
			description: item.category.description || "Описание категории.",
		},
		articul: item.articul,
		sizes: item.sizes || [],
	}));
};

// Основной компонент
const Menu = () => {
	const router = useRouter();
	const search = useSearchParams();
	const [cart, setCart] = useState<any[]>([]);
	const params = new URLSearchParams(search.toString());
	const stateCart = search.get("cart");

	const companyInfo = {
		name: 'Кофейня "Mokaлайт"',
		inn: "616712086883",
		contact: {
			email: "aprnd95@gmail.com",
			address: "г Таганрог ул. Петровская 65.",
		},
		serviceInfo:
			"Все данные пользователя защищены. Заказы принимаются с  08:00 до 23:00. Доставка осуществляется в течение 30 минут после оформления заказа.",
		paymentInfo: "Оплата осуществляется онлайн через сайт.",
		deliveryInfo: "Доставка осуществляется бесплатно при заказе.",
		refundInfo:
			"Возврат денежных средств возможен в течение 14 дней с момента покупки при наличии чека и сохранении товарного вида продукции.",
		offerLink: "/pages/offer",
	};

	// Преобразованные данные из database.js
	const menuItems: MenuItem[] = transformMenuItems(menuData);

	// Получение уникальных категорий
	function getUniqueCategories(products: MenuItem[]) {
		const categorySet = new Set<string>();
		const uniqueCategories: Category[] = [];

		products.forEach((product) => {
			const categoryName = product.category.name;
			if (!categorySet.has(categoryName)) {
				categorySet.add(categoryName);
				uniqueCategories.push(product.category);
			}
		});

		return uniqueCategories;
	}

	// Инициализация корзины из localStorage или URL
	useEffect(() => {
		const savedCart = localStorage.getItem("cart");
		if (savedCart) {
			setCart(JSON.parse(savedCart));
		} else if (stateCart) {
			const cartString = stateCart;
			const initialCart = JSON.parse(decodeURIComponent(cartString)) || [];
			setCart(initialCart);
		}
	}, [stateCart]);

	// Сохранение корзины в localStorage и обновление URL
	useEffect(() => {
		localStorage.setItem("cart", JSON.stringify(cart));
		const params = new URLSearchParams(search.toString());
		params.set("cart", encodeURIComponent(JSON.stringify(cart)));
	}, [cart]);

	// Удаление пустой корзины из localStorage
	useEffect(() => {
		if (cart.length > 0) {
			localStorage.setItem("cart", JSON.stringify(cart));
		} else {
			localStorage.removeItem("cart");
		}
	}, [cart]);

	// Загрузка данных с бэкенда (оставлено для совместимости)
	useEffect(() => {
		const fetchDishes = async () => {
			try {
				const response = await fetch("http://localhost:3001/proxy/dishes");
				const data = await response.json();
				console.log("Backend data:", data);
			} catch (error) {
				console.error("Ошибка при получении данных:", error);
			}
		};

		fetchDishes();
	}, []);

	// Добавление в корзину
	const addToCart = (item: MenuItem) => {
		const existingItem = cart.find(
			(cartItem: any) => cartItem.name === item.name
		);
		if (existingItem) {
			setCart(
				cart.map((cartItem: any) =>
					cartItem.name === item.name
						? { ...cartItem, quantity: cartItem.quantity + 1 }
						: cartItem
				)
			);
		} else {
			setCart([...cart, { ...item, quantity: 1 }]);
		}
	};

	// Переход в корзину
	const goToCart = () => {
		const cartString = JSON.stringify(cart);
		router.push(`/pages/cart`);
	};

	// Уменьшение количества
	const decreaseQuantity = (item: MenuItem) => {
		const updatedCart = cart.map((cartItem: any) =>
			cartItem.name === item.name
				? { ...cartItem, quantity: cartItem.quantity - 1 }
				: cartItem
		);
		setCart(updatedCart.filter((cartItem: any) => cartItem.quantity > 0));
	};

	// Подсчёт общей суммы
	const calculateTotal = () => {
		return cart.reduce((total: number, item: any) => {
			const price = parseFloat(item.price.replace(" Р", ""));
			return total + price * item.quantity;
		}, 0);
	};

	// Переход на страницу продукта
	const goToProductPage = (item: MenuItem) => {
		const cartString = JSON.stringify(cart);
		router.push(
			`/pages/product?product=${encodeURIComponent(
				JSON.stringify(item)
			)}&cart=${encodeURIComponent(cartString)}`
		);
	};

	return (
		<>
			<Header
				linList={getUniqueCategories(menuItems)}
				currentLink={getUniqueCategories(menuItems)[0]?.name}
			/>
			<section>
				{getUniqueCategories(menuItems).map(
					(category: Category, index: number) => {
						return (
							<div className={css.content} id={category.name} key={index}>
								<p className={css.categoryName}>{category.name}</p>
								<p className={css.categoryDescription}>
									{category.description}
								</p>
								<div className={css.menu}>
									{menuItems.map((item: MenuItem, index: number) => {
										if (category.name !== item.category.name) {
											return null;
										}
										return (
											<div
												key={index}
												className={
													!cart.find(
														(cartItem: any) => cartItem.name === item.name
													)?.quantity
														? css.menuItem
														: css.selectItem
												}
											>
												<div className={css.imgWrapper}>
													<Image
														className={css.itemImage}
														src={item.image}
														alt={item.name}
														fill
														onClick={() => goToProductPage(item)}
													/>
												</div>
												<div className={css.contentWrapper}>
													<div className={css.cartTitle}>{item.name}</div>
													<div className={css.cartDescription}>
														{item.description}
													</div>
													{item.weight && (
														<div className={css.cartWeight}>{item.weight}</div>
													)}
												</div>
												<div className={css.quantityControls}>
													{!cart.find(
														(cartItem: any) => cartItem.name === item.name
													)?.quantity ? (
														<button
															className={css.priceBtn}
															onClick={() => addToCart(item)}
														>
															{item.price}
														</button>
													) : (
														<div className={css.countWrapper}>
															<button
																className={css.countBtn}
																onClick={() => decreaseQuantity(item)}
															>
																-
															</button>
															<span className={css.countField}>
																{
																	cart.find(
																		(cartItem: any) =>
																			cartItem.name === item.name
																	)?.quantity
																}
															</span>
															<button
																className={css.countBtn}
																onClick={() => addToCart(item)}
															>
																+
															</button>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						);
					}
				)}
			</section>
			<section className={css.companyInfoSection}>
				<h2>Информация о компании</h2>
				<div className={css.companyInfo}>
					<p>
						<strong>Наименование организации:</strong> {companyInfo.name}
					</p>
					<p>
						<strong>ИНН:</strong> {companyInfo.inn}
					</p>
					<p>
						<strong>Контактные данные:</strong>
					</p>
					<ul>
						<li>Email: {companyInfo.contact.email}</li>
						<li>Адрес: {companyInfo.contact.address}</li>
					</ul>
					<p>
						<strong>Порядок оказания услуг:</strong> {companyInfo.serviceInfo}
					</p>
					<p>
						<strong>Условия оплаты:</strong> {companyInfo.paymentInfo}
					</p>
					<p>
						<strong>Условия доставки:</strong> {companyInfo.deliveryInfo}
					</p>
					<p>
						<strong>Условия возврата:</strong> {companyInfo.refundInfo}
					</p>
				</div>
				<p>
					Для ознакомления с условиями оферты, пожалуйста, перейдите по
					следующей ссылке:
				</p>
				<a href={companyInfo.offerLink} className={css.offerLink}>
					Условия оферты
				</a>
			</section>
			<button type="button" className="btn payment" onClick={goToCart}>
				Корзина {calculateTotal() === 0 ? "" : calculateTotal() + " Р"}
			</button>
		</>
	);
};

export default Menu;

// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { useRouter, useSearchParams } from "next/navigation";
// import Header from "@/app/components/header";

// import css from "./menu.module.css";

// const Menu = () => {
// 	const router = useRouter();
// 	const search = useSearchParams();
// 	const [cart, setCart]: any = useState([]);
// 	const params = new URLSearchParams(search.toString());
// 	const stateCart = search.get("cart");

// 	const companyInfo = {
// 		name: 'Кофейня "Mokaлайт"',
// 		inn: "616712086883",
// 		contact: {
// 			email: "aprnd95@gmail.com",
// 			address: "г Таганрог ул. Петровская 65.",
// 		},
// 		serviceInfo:
// 			"Все данные пользователя защищены. Заказы принимаются с  08:00 до 23:00. Доставка осуществляется в течение 30 минут после оформления заказа.",
// 		paymentInfo: "Оплата осуществляется онлайн через сайт.",
// 		deliveryInfo: "Доставка осуществляется бесплатно при заказе.",
// 		refundInfo:
// 			"Возврат денежных средств возможен в течение 14 дней с момента покупки при наличии чека и сохранении товарного вида продукции.",
// 		offerLink: "/pages/offer",
// 	};

// 	const menuItems = [
// 		{
// 			name: "Эспрессо",
// 			price: "50 Р",
// 			image: "/express.jfif",
// 			description: "Состав: вода, кофейные зерна.",
// 			weight: "30 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Кофе",
// 				description:
// 					"Наши горячие напитки — это идеальный способ начать день или согреться в холодную погоду. Мы предлагаем широкий выбор кофе и других горячих напитков, приготовленных с любовью и заботой.",
// 			},
// 		},
// 		{
// 			name: "Американо",
// 			price: "70 Р",
// 			image: "/americano.jfif",
// 			description: "Состав: эспрессо, горячая вода.",
// 			weight: "250 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Кофе",
// 				description:
// 					"Наши горячие напитки — это идеальный способ начать день или согреться в холодную погоду. Мы предлагаем широкий выбор кофе и других горячих напитков, приготовленных с любовью и заботой.",
// 			},
// 		},
// 		{
// 			name: "Капучино",
// 			price: "100 Р",
// 			image: "/capo.jfif",
// 			description: "Состав: эспрессо, вспененное молоко.",
// 			weight: "200 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Кофе",
// 				description:
// 					"Наши горячие напитки — это идеальный способ начать день или согреться в холодную погоду. Мы предлагаем широкий выбор кофе и других горячих напитков, приготовленных с любовью и заботой.",
// 			},
// 		},
// 		{
// 			name: "Латте",
// 			price: "120 Р",
// 			image: "/latte.jfif",
// 			description: "Состав: эспрессо, горячее молоко, молочная пена.",
// 			weight: "250 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Кофе",
// 				description:
// 					"Наши горячие напитки — это идеальный способ начать день или согреться в холодную погоду. Мы предлагаем широкий выбор кофе и других горячих напитков, приготовленных с любовью и заботой.",
// 			},
// 		},
// 		{
// 			name: "Мокко",
// 			price: "150 Р",
// 			image: "/moco.jfif",
// 			description: "Состав: эспрессо, горячий шоколад, вспененное молоко.",
// 			weight: "250 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Кофе",
// 				description:
// 					"Наши горячие напитки — это идеальный способ начать день или согреться в холодную погоду. Мы предлагаем широкий выбор кофе и других горячих напитков, приготовленных с любовью и заботой.",
// 			},
// 		},
// 		{
// 			name: "Лимонад",
// 			price: "80 Р",
// 			image: "/lemonade.jpg",
// 			description: "Состав: вода, лимонный сок, сахар.",
// 			weight: "300 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Напитки",
// 				description:
// 					"Наши прохладительные напитки — это отличный способ освежиться в жаркий день. Мы предлагаем широкий выбор лимонадов, соков, смузи и других освежающих напитков, приготовленных из натуральных ингредиентов.",
// 			},
// 		},
// 		{
// 			name: "Кола",
// 			price: "60 Р",
// 			image: "/cola.jpg",
// 			description: "Состав: газированная вода, сахар, ароматизаторы.",
// 			weight: "330 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Напитки",
// 				description:
// 					"Наши прохладительные напитки — это отличный способ освежиться в жаркий день. Мы предлагаем широкий выбор лимонадов, соков, смузи и других освежающих напитков, приготовленных из натуральных ингредиентов.",
// 			},
// 		},
// 		{
// 			name: "Сок",
// 			price: "70 Р",
// 			image: "/juice.jfif",
// 			description: "Состав: натуральные фрукты.",
// 			weight: "200 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Напитки",
// 				description:
// 					"Наши прохладительные напитки — это отличный способ освежиться в жаркий день. Мы предлагаем широкий выбор лимонадов, соков, смузи и других освежающих напитков, приготовленных из натуральных ингредиентов.",
// 			},
// 		},
// 		{
// 			name: "Смузи",
// 			price: "100 Р",
// 			image: "/smoothie.jpg",
// 			description: "Состав: фрукты, овощи, йогурт.",
// 			weight: "300 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Напитки",
// 				description:
// 					"Наши прохладительные напитки — это отличный способ освежиться в жаркий день. Мы предлагаем широкий выбор лимонадов, соков, смузи и других освежающих напитков, приготовленных из натуральных ингредиентов.",
// 			},
// 		},
// 		{
// 			name: "Морс",
// 			price: "90 Р",
// 			image: "/mors.jpeg",
// 			description: "Состав: ягоды, вода, сахар.",
// 			weight: "250 мл",
// 			category: {
// 				icon: "/icons/coffee.png",
// 				name: "Напитки",
// 				description:
// 					"Наши прохладительные напитки — это отличный способ освежиться в жаркий день. Мы предлагаем широкий выбор лимонадов, соков, смузи и других освежающих напитков, приготовленных из натуральных ингредиентов.",
// 			},
// 		},
// 		{
// 			name: "Каша рисовая с ягодами и орехами",
// 			price: "239 Р",
// 			image: "/food2.png",
// 			description: "Состав: рис, ягоды, орехи.",
// 			weight: "300 г",
// 			category: {
// 				icon: "/icons/food.png",
// 				name: "Основные блюда",
// 				description:
// 					"Мы предлагаем широкий выбор блюд, которые подарят вам заряд энергии на весь день. Наши блюда — это сочетание вкуса и качества. Мы используем только свежие и натуральные продукты, чтобы каждый укус приносил вам удовольствие.",
// 			},
// 		},
// 		{
// 			name: "Каша овсяная с ягодами и орехами",
// 			price: "199 Р",
// 			image: "/food3.jpg",
// 			description: "Состав: овсяные хлопья, ягоды, орехи.",
// 			weight: "300 г",
// 			category: {
// 				icon: "/icons/food.png",
// 				name: "Основные блюда",
// 				description:
// 					"Мы предлагаем широкий выбор блюд, которые подарят вам заряд энергии на весь день. Наши блюда — это сочетание вкуса и качества. Мы используем только свежие и натуральные продукты, чтобы каждый укус приносил вам удовольствие.",
// 			},
// 		},
// 		{
// 			name: "Сырник классический с топингом",
// 			price: "179 Р",
// 			image: "/food1.jpg",
// 			description: "Состав: творог, мука, яйца, топинг.",
// 			weight: "200 г",
// 			category: {
// 				icon: "/icons/food.png",
// 				name: "Основные блюда",
// 				description:
// 					"Мы предлагаем широкий выбор блюд, которые подарят вам заряд энергии на весь день. Наши блюда — это сочетание вкуса и качества. Мы используем только свежие и натуральные продукты, чтобы каждый укус приносил вам удовольствие.",
// 			},
// 		},
// 		{
// 			name: "Сырники с маком с топингом",
// 			price: "189 Р",
// 			image: "/food4.jpg",
// 			description: "Состав: творог, мука, яйца, мак, топинг.",
// 			weight: "200 г",
// 			category: {
// 				icon: "/icons/food.png",
// 				name: "Основные блюда",
// 				description:
// 					"Мы предлагаем широкий выбор блюд, которые подарят вам заряд энергии на весь день. Наши блюда — это сочетание вкуса и качества. Мы используем только свежие и натуральные продукты, чтобы каждый укус приносил вам удовольствие.",
// 			},
// 		},
// 	];

// 	function getUniqueCategories(products: any) {
// 		const categorySet = new Set();
// 		const uniqueCategories: any = [];

// 		products.forEach((product: any) => {
// 			const categoryName = product.category.name;
// 			if (!categorySet.has(categoryName)) {
// 				categorySet.add(categoryName);
// 				uniqueCategories.push(product.category);
// 			}
// 		});

// 		return uniqueCategories;
// 	}

// 	// useEffect(() => {
// 	//   menuItems.sort((item: any) => {return item.category})
// 	//   const savedCart: any = JSON.parse(localStorage.getItem('cart') as any) || [];
// 	//   setCart(savedCart);
// 	//   cart
// 	// }, []);

// 	// useEffect(() => {
// 	//   const params = new URLSearchParams(search.toString())
// 	//   params.set('cart',encodeURIComponent(JSON.stringify(cart)));
// 	//   localStorage.setItem('cart', JSON.stringify(cart))
// 	// }, [cart, search]);

// 	useEffect(() => {
// 		const savedCart = localStorage.getItem("cart");
// 		if (savedCart) {
// 			setCart(JSON.parse(savedCart));
// 		} else if (stateCart) {
// 			const cartString = stateCart;
// 			const initialCart = JSON.parse(decodeURIComponent(cartString)) || [];
// 			setCart(initialCart);
// 		}
// 	}, [stateCart]);

// 	useEffect(() => {
// 		localStorage.setItem("cart", JSON.stringify(cart));
// 		const params = new URLSearchParams(search.toString());
// 		params.set("cart", encodeURIComponent(JSON.stringify(cart)));
// 	}, [cart]);

// 	useEffect(() => {
// 		if (cart.length > 0) {
// 			localStorage.setItem("cart", JSON.stringify(cart));
// 		} else {
// 			localStorage.removeItem("cart");
// 		}
// 	}, [cart]);

// 	useEffect(() => {
// 		const fetchDishes = async () => {
// 			try {
// 				const response = await fetch("http://localhost:3001/proxy/dishes");
// 				// if (!response.ok) {
// 				// 	throw new Error(`Ошибка: ${response.status}`);
// 				// }
// 				const data = await response.json();
// 				console.log("data", data);

// 				const sortedItems = data.sort((a, b) =>
// 					a.category.localeCompare(b.category)
// 				);
// 				// setMenuItems(sortedItems);
// 			} catch (error) {
// 				console.error("Ошибка при получении данных:", error);
// 			} finally {
// 				// setIsLoading(false);
// 			}
// 		};

// 		fetchDishes();
// 	}, []);

// 	const addToCart = (item: any) => {
// 		const existingItem = cart.find(
// 			(cartItem: any) => cartItem.name === item.name
// 		);
// 		if (existingItem) {
// 			setCart(
// 				cart.map((cartItem: any) =>
// 					cartItem.name === item.name
// 						? { ...cartItem, quantity: cartItem.quantity + 1 }
// 						: cartItem
// 				)
// 			);
// 		} else {
// 			setCart([...cart, { ...item, quantity: 1 }]);
// 		}
// 	};

// 	const goToCart = () => {
// 		const cartString = JSON.stringify(cart);
// 		router.push(`/pages/cart`);
// 	};

// 	const decreaseQuantity = (item: any) => {
// 		const updatedCart = cart.map((cartItem: any) =>
// 			cartItem.name === item.name
// 				? { ...cartItem, quantity: cartItem.quantity - 1 }
// 				: cartItem
// 		);
// 		setCart(updatedCart.filter((cartItem: any) => cartItem.quantity > 0));
// 	};

// 	const calculateTotal = () => {
// 		return cart.reduce((total: number, item: any) => {
// 			const price = parseFloat(item.price.replace(" руб.", ""));
// 			return total + price * item.quantity;
// 		}, 0);
// 	};

// 	const goToProductPage = (item: any) => {
// 		const cartString = JSON.stringify(cart);
// 		router.push(
// 			`/pages/product?product=${encodeURIComponent(
// 				JSON.stringify(item)
// 			)}&cart=${encodeURIComponent(cartString)}`
// 		);
// 	};

// 	return (
// 		<>
// 			<Header
// 				linList={getUniqueCategories(menuItems)}
// 				currentLink={getUniqueCategories(menuItems)[0].name}
// 			/>
// 			<section>
// 				{getUniqueCategories(menuItems).map((category: any, index: number) => {
// 					return (
// 						<div className={css.content} id={category.name} key={index}>
// 							<p className={css.categoryName}>{category.name}</p>
// 							<p className={css.categoryDescription}>{category.description}</p>
// 							<div className={css.menu}>
// 								{menuItems.map((item, index) => {
// 									if (category.name !== item.category.name) {
// 										return null;
// 									}
// 									return (
// 										<div
// 											key={index}
// 											className={
// 												!cart.find(
// 													(cartItem: any) => cartItem.name === item.name
// 												)?.quantity
// 													? css.menuItem
// 													: css.selectItem
// 											}
// 										>
// 											<div className={css.imgWrapper}>
// 												<Image
// 													className={css.itemImage}
// 													src={item.image}
// 													alt={item.name}
// 													fill
// 													onClick={() => goToProductPage(item)}
// 												/>
// 											</div>
// 											<div className={css.contentWrapper}>
// 												<div className={css.cartTitle}>{item.name}</div>
// 												<div className={css.cartDescription}>
// 													{item.description}
// 												</div>
// 												<div className={css.cartWeight}>{item.weight}</div>
// 											</div>
// 											<div className={css.quantityControls}>
// 												{!cart.find(
// 													(cartItem: any) => cartItem.name === item.name
// 												)?.quantity ? (
// 													<button
// 														className={css.priceBtn}
// 														onClick={() => addToCart(item)}
// 													>
// 														{item.price}
// 													</button>
// 												) : (
// 													<div className={css.countWrapper}>
// 														<button
// 															className={css.countBtn}
// 															onClick={() => decreaseQuantity(item)}
// 														>
// 															-
// 														</button>
// 														<span className={css.countField}>
// 															{
// 																cart.find(
// 																	(cartItem: any) => cartItem.name === item.name
// 																)?.quantity
// 															}
// 														</span>
// 														<button
// 															className={css.countBtn}
// 															onClick={() => addToCart(item)}
// 														>
// 															+
// 														</button>
// 													</div>
// 												)}
// 											</div>
// 										</div>
// 									);
// 								})}
// 							</div>
// 						</div>
// 					);
// 				})}
// 			</section>
// 			<section className={css.companyInfoSection}>
// 				<h2>Информация о компании</h2>
// 				<div className={css.companyInfo}>
// 					<p>
// 						<strong>Наименование организации:</strong> {companyInfo.name}
// 					</p>
// 					<p>
// 						<strong>ИНН:</strong> {companyInfo.inn}
// 					</p>
// 					<p>
// 						<strong>Контактные данные:</strong>
// 					</p>
// 					<ul>
// 						<li>Email: {companyInfo.contact.email}</li>
// 						<li>Адрес: {companyInfo.contact.address}</li>
// 					</ul>
// 					<p>
// 						<strong>Порядок оказания услуг:</strong> {companyInfo.serviceInfo}
// 					</p>
// 					<p>
// 						<strong>Условия оплаты:</strong> {companyInfo.paymentInfo}
// 					</p>
// 					<p>
// 						<strong>Условия доставки:</strong> {companyInfo.deliveryInfo}
// 					</p>
// 					<p>
// 						<strong>Условия возврата:</strong> {companyInfo.refundInfo}
// 					</p>
// 				</div>
// 				<p>
// 					Для ознакомления с условиями оферты, пожалуйста, перейдите по
// 					следующей ссылке:
// 				</p>
// 				<a href={companyInfo.offerLink} className={css.offerLink}>
// 					Условия оферты
// 				</a>
// 			</section>
// 			<button type="button" className="btn payment" onClick={goToCart}>
// 				Корзина {calculateTotal() === 0 ? "" : calculateTotal() + " P"}
// 			</button>
// 		</>
// 	);
// };

// export default Menu;
