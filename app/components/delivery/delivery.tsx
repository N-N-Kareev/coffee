"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import css from "./delivery.module.css";

interface CartItem {
	name: string;
	price: string;
	quantity: number;
	image: string;
	articul: number;
	description?: string;
	category?: { name: string; icon: string; description: string };
}

const Delivery: React.FC = () => {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		address: "",
	});
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const router = useRouter();
	const orderId = searchParams.get("orderId");
	const stateCart = searchParams.get("cart");

	useEffect(() => {
		if (stateCart) {
			try {
				const initialCart = JSON.parse(decodeURIComponent(stateCart)) || [];
				setCart(initialCart);
			} catch (e) {
				console.error("Error parsing cart from URL:", e);
				setError("Ошибка загрузки корзины");
			}
		} else {
			const savedCart = localStorage.getItem("cart");
			if (savedCart) {
				setCart(JSON.parse(savedCart));
			}
		}
	}, [stateCart]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const validateForm = () => {
		if (!formData.name.trim()) {
			return "Укажите имя";
		}
		if (!/^\+?\d{10,12}$/.test(formData.phone.replace(/\D/g, ""))) {
			return "Укажите корректный номер телефона";
		}
		if (!formData.address.trim()) {
			return "Укажите адрес";
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		try {
			// Добавляем "г. Таганрог, " к адресу
			const fullAddress = `г. Таганрог, ${formData.address.trim()}`;
			const deliveryData = {
				orderId,
				customer: {
					...formData,
					address: fullAddress,
				},
				cart,
				total: calculateTotal(),
				submittedAt: new Date().toISOString(),
			};

			// Вывод в консоль
			console.log("Оформление доставки:");
			console.log("Order ID:", orderId);
			console.log("Customer:", deliveryData.customer);
			console.log("Cart:", cart);
			console.log("Total:", calculateTotal(), "Р");
			console.log("Full Delivery Data:", deliveryData);

			// Сохранение в localStorage для отладки
			localStorage.setItem("lastDelivery", JSON.stringify(deliveryData));

			// Очистка корзины
			setCart([]);
			localStorage.removeItem("cart");

			// Перенаправление на главную
			router.push("/?orderConfirmed=true");
		} catch (error) {
			console.error("Error simulating delivery submission:", error);
			setError("Не удалось оформить доставку. Попробуйте позже.");
		}
	};

	const calculateTotal = () => {
		return cart.reduce((total, item) => {
			const price = parseFloat(item.price.replace(" Р", ""));
			return total + price * item.quantity;
		}, 0);
	};

	const calculate = (count: number, price: string) => {
		const clearPrice = parseFloat(price.replace(" Р", ""));
		return clearPrice * count;
	};

	const backToCart = () => {
		router.push(`/pages/cart?cart=${encodeURIComponent(JSON.stringify(cart))}`);
	};

	return (
		<div>
			<button onClick={backToCart} className={css.backBtn}>
				{"<"}
			</button>
			<section className={css.section}>
				<div className={css.headingPrimary}>Оформление доставки</div>
				<div className={css.cartSection}>
					<div className={css.headingSecondary}>Ваш заказ</div>
					{cart.length === 0 ? (
						<p>Корзина пуста</p>
					) : (
						<>
							{cart.map((item, index) => (
								<div key={index} className={css.cartItem}>
									<div className={css.cartImageWrapper}>
										<Image
											className={css.cartImage}
											src={item.image}
											alt={item.name}
											width={80}
											height={80}
										/>
									</div>
									<div className="cart-content-wrapper">
										<div className={css.cartTitleSum}>
											<span className={css.cartTitle}>{item.name}</span>
											<span className={css.sum}>
												{calculate(item.quantity, item.price) + " Р"}
											</span>
										</div>
										<div className={css.quantityControls}>
											<span className={css.countField}>
												Количество: {item.quantity}
											</span>
										</div>
									</div>
								</div>
							))}
							<div className="total-price">
								Общая стоимость: {calculateTotal()} Р
							</div>
						</>
					)}
				</div>
				<form onSubmit={handleSubmit} className={css.deliveryForm}>
					<div className={css.headingSecondary}>Данные для доставки</div>
					<div className={css.formGroup}>
						<label htmlFor="name">Имя</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder="Иван"
							required
						/>
					</div>
					<div className={css.formGroup}>
						<label htmlFor="phone">Телефон</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleInputChange}
							placeholder="+79991234567"
							required
						/>
					</div>
					<div className={css.formGroup}>
						<label htmlFor="address">Адрес в Таганроге</label>
						<input
							type="text"
							id="address"
							name="address"
							value={formData.address}
							onChange={handleInputChange}
							placeholder="ул. Петровская, 78"
							required
						/>
						<small>Доставка осуществляется только по Таганрогу</small>
					</div>
					{error && <div className={css.error}>{error}</div>}
					<button type="submit" className="btn payment">
						Подтвердить заказ
					</button>
				</form>
			</section>
		</div>
	);
};

export default Delivery;
