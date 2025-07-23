"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/header";
import css from "./menu.module.css";
import menuData from "./database.js";

// Интерфейс для категории
interface Category {
	icon: string;
	name: string;
	description: string;
}

// Интерфейс для варианта блюда
interface ProductVariant {
	size: string;
	price: string;
	weight: string;
	articul: string;
}

// Интерфейс для блюда
interface Product {
	name: string;
	image: string;
	description: string;
	category: Category;
	variants: ProductVariant[];
}

// Интерфейс для элемента корзины
interface CartItem {
	name: string;
	price: string;
	quantity: number;
	image: string;
	articul: string;
	size: string;
}

// Преобразование данных из database.js
const transformMenuItems = (data: any[]): Product[] => {
	const imageMap: { [key: string]: string } = {
		Кофе: "/coffee.jfif",
		Чай: "/tea.jpg",
		"Прохладительные напитки": "/lemonade.jpg",
		Выпечка: "/bakeryother.png",
		"Основные блюда": "/food.jpg",
		Другое: "/other.png",
	};

	const svgIcons: { [key: string]: string } = {
		Кофе: `/icons/coffee.png`,
		Чай: `/icons/tea.png`,
		"Прохладительные напитки": `/icons/lemonade.png`,
		Выпечка: `/icons/bakery.png`,
		"Основные блюда": `/icons/food.png`,
		Другое: `/icons/other.png`,
	};

	const groupedItems: { [key: string]: Product } = {};

	data.forEach((item) => {
		const baseName = item.name.replace(/\s*\d+\s*мл$/, "").trim();

		if (!groupedItems[baseName]) {
			groupedItems[baseName] = {
				name: baseName,
				image: imageMap[item.category.name] || "/default.jfif",
				description: item.description || `Состав: ${baseName.toLowerCase()}.`,
				category: {
					icon: svgIcons[item.category.name] || "",
					name: item.category.name,
					description: item.category.description || "Описание категории.",
				},
				variants: [],
			};
		}

		const variants = item.sizes?.length
			? item.sizes.map((size: any, index: number) => ({
					size: size.size || size.weight,
					price: `${size.price} Р`,
					weight: size.weight || size.size || "Не указан",
					articul: `${item.articul}-${index}`,
			  }))
			: [
					{
						size: item.name,
						price: `${item.price} Р`,
						weight: "Не указан",
						articul: `${item.articul}-0`,
					},
			  ];

		groupedItems[baseName].variants.push(...variants);
	});

	return Object.values(groupedItems);
};

// Основной компонент
const Menu: React.FC = () => {
	const router = useRouter();
	const search = useSearchParams();
	const [cart, setCart] = useState<CartItem[]>([]);
	const stateCart = search.get("cart");

	const companyInfo = {
		name: "ИП Устименко Павел Владимирович",
		inn: "615422223889",
		contact: {
			email: "ustimenkopaul@yandex.ru",
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

	// Преобразованные данные
	const products: Product[] = transformMenuItems(menuData);

	// Получение уникальных категорий
	const getUniqueCategories = (products: Product[]): Category[] => {
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
	};

	// Инициализация корзины
	useEffect(() => {
		const savedCart = localStorage.getItem("cart");
		if (savedCart) {
			setCart(JSON.parse(savedCart));
		} else if (stateCart) {
			try {
				const initialCart = JSON.parse(decodeURIComponent(stateCart)) || [];
				setCart(initialCart);
			} catch (e) {
				console.error("Error parsing cart from URL:", e);
			}
		}
	}, [stateCart]);

	// Сохранение корзины в localStorage
	useEffect(() => {
		if (cart.length > 0) {
			localStorage.setItem("cart", JSON.stringify(cart));
		} else {
			localStorage.removeItem("cart");
		}
	}, [cart]);

	// Загрузка данных с бэкенда (для совместимости)
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
	const addToCart = (product: Product, selectedSize: string) => {
		const variant = product.variants.find((v) => v.size === selectedSize);
		if (!variant) return;

		const cartItem: CartItem = {
			name: `${product.name} ${variant.size}`,
			price: variant.price,
			quantity: 1,
			image: product.image,
			articul: variant.articul,
			size: variant.size,
		};

		const existingItem = cart.find(
			(cartItem) => cartItem.name === `${product.name} ${variant.size}`
		);
		if (existingItem) {
			setCart(
				cart.map((cartItem) =>
					cartItem.name === `${product.name} ${variant.size}`
						? { ...cartItem, quantity: cartItem.quantity + 1 }
						: cartItem
				)
			);
		} else {
			setCart([...cart, cartItem]);
		}

		console.log("Добавлено в корзину:", cartItem);
	};

	// Подсчёт общей суммы
	const calculateTotal = () => {
		return cart.reduce((total: number, item: CartItem) => {
			const price = parseFloat(item.price.replace(" Р", ""));
			return total + price * item.quantity;
		}, 0);
	};

	// Переход на страницу продукта
	const goToProductPage = (product: Product) => {
		const cartString = JSON.stringify(cart);
		router.push(
			`/pages/product?product=${encodeURIComponent(
				JSON.stringify(product)
			)}&cart=${encodeURIComponent(cartString)}`
		);
	};

	// Переход в корзину
	const goToCart = () => {
		router.push(`/pages/cart`);
	};

	// Нахождение минимальной цены
	const getMinPrice = (variants: ProductVariant[]): string => {
		if (!variants.length) return "0 Р";
		const minPrice = Math.min(
			...variants.map((v) => parseFloat(v.price.replace(" Р", "")))
		);
		return `${minPrice} Р`;
	};

	// Подсчёт общего количества для продукта (всех размеров)
	const getTotalQuantity = (product: Product): number => {
		return cart
			.filter((item) => item.name.startsWith(`${product.name} `))
			.reduce((total, item) => total + item.quantity, 0);
	};

	return (
		<>
			<Header
				linList={getUniqueCategories(products)}
				currentLink={getUniqueCategories(products)[0]?.name}
			/>
			<section>
				{getUniqueCategories(products).map((category, index) => (
					<div className={css.content} id={category.name} key={index}>
						<p className={css.categoryName}>{category.name}</p>
						<p className={css.categoryDescription}>{category.description}</p>
						<div className={css.menu}>
							{products.map((product, index) => {
								if (category.name !== product.category.name) {
									return null;
								}
								const totalQuantity = getTotalQuantity(product);
								const minPrice = getMinPrice(product.variants);
								return (
									<div
										key={index}
										className={
											totalQuantity > 0 ? css.selectItem : css.menuItem
										}
										onClick={() => goToProductPage(product)}
									>
										<div className={css.imgWrapper}>
											<Image
												className={css.itemImage}
												src={product.image}
												alt={product.name}
												fill
											/>
										</div>
										<div className={css.contentWrapper}>
											<div className={css.cartTitle}>{product.name}</div>
											<div className={css.cartDescription}>
												{product.description}
											</div>
											<div className={css.cartVariants}>
												{totalQuantity > 0 && (
													<span className={css.quantityBadge}>
														{totalQuantity} шт
													</span>
												)}

												<button
													className={css.priceBtn}
													onClick={(e) => {
														e.stopPropagation();
														goToProductPage(product);
													}}
												>
													от {minPrice}
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				))}
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
