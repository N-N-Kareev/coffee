"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import css from "./product.module.css";

interface ProductVariant {
	size: string;
	price: string;
	weight: string;
	articul: string;
}

interface Product {
	name: string;
	image: string;
	description?: string;
	category?: { name: string; icon: string; description: string };
	variants: ProductVariant[];
}

interface CartItem {
	name: string;
	price: string;
	quantity: number;
	image: string;
	articul: string;
	size: string;
}

const ProductPage: React.FC = () => {
	const search = useSearchParams();
	const product: Product = JSON.parse(search.get("product") || "{}");
	const [cart, setCart] = useState<CartItem[]>([]);
	const [quantityToAdd, setQuantityToAdd] = useState(1);
	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
		product.variants?.[0] || null
	);
	const stateCart = search.get("cart");
	const router = useRouter();

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

	useEffect(() => {
		if (cart.length > 0) {
			localStorage.setItem("cart", JSON.stringify(cart));
		} else {
			localStorage.removeItem("cart");
		}
	}, [cart]);

	useEffect(() => {
		console.log("Product:", product);
		console.log("Product variants:", product.variants);
		console.log("Current selectedVariant:", selectedVariant);
		console.log(
			"Available variants:",
			product.variants?.map((v) => ({
				size: v.size,
				price: v.price,
				articul: v.articul,
			}))
		);
	}, [product, product.variants, selectedVariant]);

	const addToCart = (variant: ProductVariant, quantity: number = quantityToAdd) => {
		if (!variant) {
			console.error("No variant provided");
			return;
		}

		const cartItem: CartItem = {
			name: `${product.name} ${variant.size}`,
			price: variant.price,
			quantity: quantity,
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
						? { ...cartItem, quantity: cartItem.quantity + quantity }
						: cartItem
				)
			);
		} else {
			setCart([...cart, cartItem]);
		}

		console.log("Добавлено в корзину:", cartItem);
		setQuantityToAdd(1);
	};

	const decreaseQuantity = (item: CartItem) => {
		const updatedCart = cart.map((cartItem) =>
			cartItem.name === item.name
				? { ...cartItem, quantity: cartItem.quantity - 1 }
				: cartItem
		);
		setCart(updatedCart.filter((cartItem) => cartItem.quantity > 0));
	};

	const calculate = (count: number, price: string) => {
		const clearPrice = parseFloat(price.replace(" Р", ""));
		return clearPrice * count;
	};

	const handleSizeClick = (variant: ProductVariant) => {
		setSelectedVariant(variant);
		addToCart(variant);
	};

	const existingItems = cart.filter((cartItem) =>
		cartItem.name.startsWith(`${product.name} `)
	);

	// Валидация
	if (!product.variants || product.variants.length === 0) {
		console.error("No variants available for", product.name);
		return <p className={css.error}>Размеры недоступны</p>;
	}

	// Проверка на одинаковые размеры
	const uniqueSizes = new Set(product.variants.map((v) => v.size));
	if (uniqueSizes.size === 1) {
		console.warn("All variants have the same size:", uniqueSizes);
	}

	return (
		<div className={css.productPage}>
			<button className={css.backBtn} onClick={() => router.back()}>
				{"<"}
			</button>
			<div>
				<div className={css.imageWrapper}>
					<Image
						className={css.image}
						src={product.image}
						alt={product.name}
						fill
					/>
				</div>
				<div className={css.content}>
					<div className={css.productText}>
						<p className={css.name}>{product.name}</p>
						<p className={css.cartDescription}>{product.description}</p>
						{selectedVariant && (
							<p className={css.cartDescription}>{selectedVariant.weight}</p>
						)}
					</div>
					<div className={css.sizeSelector}>
						<p>Выберите размер:</p>
						<div className={css.sizeButtons}>
							{product.variants.map((variant) => (
								<button
									key={variant.articul}
									className={`${css.sizeBtn} ${
										selectedVariant?.articul === variant.articul ? css.selected : ""
									}`}
									onClick={() => handleSizeClick(variant)}
								>
									{variant.size} - {variant.price}
								</button>
							))}
						</div>
					</div>
					{existingItems.length > 0 && (
						<div className={css.quantity}>
							<p className={css.quantityDescription}>В корзине</p>
							{existingItems.map((item) => (
								<div key={item.articul} className={css.quantityItem}>
									<span>{item.size} - {item.price}</span>
									<div className={css.quantityControlsInline}>
										<button
											className={css.countBtn}
											onClick={() => decreaseQuantity(item)}
										>
											-
										</button>
										<span className={css.countField}>{item.quantity}</span>
										<button
											className={css.countBtn}
											onClick={() => addToCart({ ...item, quantity: 1 })}
										>
											+
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
				<div className={css.quantityControls}>
					<div className={css.countWrapper}>
						<button
							className={css.countBtn}
							onClick={() => setQuantityToAdd(quantityToAdd - 1)}
							disabled={quantityToAdd <= 1}
						>
							-
						</button>
						<span className={css.countField}>{quantityToAdd}</span>
						<button
							className={css.countBtn}
							onClick={() => setQuantityToAdd(quantityToAdd + 1)}
						>
							+
						</button>
					</div>
					{selectedVariant && (
						<button
							className={css.priceBtn}
							onClick={() => addToCart(selectedVariant)}
						>
							{"Добавить " + calculate(quantityToAdd, selectedVariant.price) + " Р"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProductPage;

// "use client";
//
// import React, { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import css from "./product.module.css";
//
// interface ProductVariant {
// 	size: string;
// 	price: string;
// 	weight: string;
// 	articul: string; // Изменено с number на string для согласованности
// }
//
// interface Product {
// 	name: string;
// 	image: string;
// 	description?: string;
// 	category?: { name: string; icon: string; description: string };
// 	variants: ProductVariant[];
// }
//
// interface CartItem {
// 	name: string;
// 	price: string;
// 	quantity: number;
// 	image: string;
// 	articul: string; // Изменено с number на string для согласованности
// 	size: string;
// }
//
// const ProductPage: React.FC = () => {
// 	const search = useSearchParams();
// 	const product: Product = JSON.parse(search.get("product") || "{}");
// 	const [cart, setCart] = useState<CartItem[]>([]);
// 	const [quantityToAdd, setQuantityToAdd] = useState(1);
// 	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
// 		product.variants?.[0] || null
// 	);
// 	const stateCart = search.get("cart");
// 	const router = useRouter();
//
// 	useEffect(() => {
// 		const savedCart = localStorage.getItem("cart");
// 		if (savedCart) {
// 			setCart(JSON.parse(savedCart));
// 		} else if (stateCart) {
// 			try {
// 				const initialCart = JSON.parse(decodeURIComponent(stateCart)) || [];
// 				setCart(initialCart);
// 			} catch (e) {
// 				console.error("Error parsing cart from URL:", e);
// 			}
// 		}
// 	}, [stateCart]);
//
// 	useEffect(() => {
// 		if (cart.length > 0) {
// 			localStorage.setItem("cart", JSON.stringify(cart));
// 		} else {
// 			localStorage.removeItem("cart");
// 		}
// 	}, [cart]);
//
// 	useEffect(() => {
// 		console.log("Product:", product);
// 		console.log("Product variants:", product.variants);
// 		console.log("Current selectedVariant:", selectedVariant);
// 		console.log(
// 			"Available variants:",
// 			product.variants?.map((v) => ({
// 				size: v.size,
// 				price: v.price,
// 				articul: v.articul,
// 			}))
// 		);
// 	}, [product, product.variants, selectedVariant]);
//
// 	const addToCart = (variant: ProductVariant) => {
// 		if (!variant) {
// 			console.error("No variant provided");
// 			return;
// 		}
//
// 		const cartItem: CartItem = {
// 			name: `${product.name} ${variant.size}`,
// 			price: variant.price,
// 			quantity: quantityToAdd,
// 			image: product.image,
// 			articul: variant.articul,
// 			size: variant.size,
// 		};
//
// 		const existingItem = cart.find(
// 			(cartItem) => cartItem.name === `${product.name} ${variant.size}`
// 		);
// 		if (existingItem) {
// 			setCart(
// 				cart.map((cartItem) =>
// 					cartItem.name === `${product.name} ${variant.size}`
// 						? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
// 						: cartItem
// 				)
// 			);
// 		} else {
// 			setCart([...cart, cartItem]);
// 		}
//
// 		console.log("Добавлено в корзину:", cartItem);
// 		setQuantityToAdd(1);
// 	};
//
// 	const calculate = (count: number, price: string) => {
// 		const clearPrice = parseFloat(price.replace(" Р", ""));
// 		return clearPrice * count;
// 	};
//
// 	const handleSizeClick = (variant: ProductVariant) => {
// 		setSelectedVariant(variant);
// 		addToCart(variant);
// 	};
//
// 	const existingItems = cart.filter((cartItem) =>
// 		cartItem.name.startsWith(`${product.name} `)
// 	);
//
// 	// Валидация
// 	if (!product.variants || product.variants.length === 0) {
// 		console.error("No variants available for", product.name);
// 		return <p className={css.error}>Размеры недоступны</p>;
// 	}
//
// 	// Проверка на одинаковые размеры
// 	const uniqueSizes = new Set(product.variants.map((v) => v.size));
// 	if (uniqueSizes.size === 1) {
// 		console.warn("All variants have the same size:", uniqueSizes);
// 	}
//
// 	return (
// 		<div className={css.productPage}>
// 			<button className={css.backBtn} onClick={() => router.back()}>
// 				{"<"}
// 			</button>
// 			<div>
// 				<div className={css.imageWrapper}>
// 					<Image
// 						className={css.image}
// 						src={product.image}
// 						alt={product.name}
// 						fill
// 					/>
// 				</div>
// 				<div className={css.content}>
// 					<div className={css.productText}>
// 						<p className={css.name}>{product.name}</p>
// 						<p className={css.cartDescription}>{product.description}</p>
// 						{selectedVariant && (
// 							<p className={css.cartDescription}>{selectedVariant.weight}</p>
// 						)}
// 					</div>
// 					<div className={css.sizeSelector}>
// 						<p>Выберите размер:</p>
// 						<div className={css.sizeButtons}>
// 							{product.variants.map((variant) => (
// 								<button
// 									key={variant.articul}
// 									className={`${css.sizeBtn} ${
// 										selectedVariant?.articul === variant.articul ? css.selected : ""
// 									}`}
// 									onClick={() => handleSizeClick(variant)}
// 								>
// 									{variant.size} - {variant.price}
// 								</button>
// 							))}
// 						</div>
// 					</div>
// 					{existingItems.length > 0 && (
// 						<div className={css.quantity}>
// 							<p className={css.quantityDescription}>В корзине</p>
// 							{existingItems.map((item) => (
// 								<p key={item.articul} className={css.quantityItem}>
// 									<span>{item.name}</span>
// 									<span>{item.quantity} шт</span>
// 								</p>
// 							))}
// 						</div>
// 					)}
// 				</div>
// 				<div className={css.quantityControls}>
// 					<div className={css.countWrapper}>
// 						<button
// 							className={css.countBtn}
// 							onClick={() => setQuantityToAdd(quantityToAdd - 1)}
// 							disabled={quantityToAdd <= 1}
// 						>
// 							-
// 						</button>
// 						<span className={css.countField}>{quantityToAdd}</span>
// 						<button
// 							className={css.countBtn}
// 							onClick={() => setQuantityToAdd(quantityToAdd + 1)}
// 						>
// 							+
// 						</button>
// 					</div>
// 					{selectedVariant && (
// 						<button
// 							className={css.priceBtn}
// 							onClick={() => addToCart(selectedVariant)}
// 						>
// 							{"Добавить " + calculate(quantityToAdd, selectedVariant.price) + " Р"}
// 						</button>
// 					)}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
//
// export default ProductPage;

// "use client";
//
// import React, { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import css from "./product.module.css";
//
// interface ProductVariant {
// 	size: string;
// 	price: string;
// 	weight: string;
// 	articul: number;
// }
//
// interface Product {
// 	name: string;
// 	image: string;
// 	description?: string;
// 	category?: { name: string; icon: string; description: string };
// 	variants: ProductVariant[];
// }
//
// interface CartItem {
// 	name: string;
// 	price: string;
// 	quantity: number;
// 	image: string;
// 	articul: number;
// 	size: string;
// }
//
// const ProductPage: React.FC = () => {
// 	const search = useSearchParams();
// 	const product: Product = JSON.parse(search.get("product") || "{}");
// 	const [cart, setCart] = useState<CartItem[]>([]);
// 	const [quantityToAdd, setQuantityToAdd] = useState(1);
// 	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
// 		product.variants?.[0] || null
// 	);
// 	const stateCart = search.get("cart");
// 	const router = useRouter();
//
// 	useEffect(() => {
// 		const savedCart = localStorage.getItem("cart");
// 		if (savedCart) {
// 			setCart(JSON.parse(savedCart));
// 		} else if (stateCart) {
// 			try {
// 				const initialCart = JSON.parse(decodeURIComponent(stateCart)) || [];
// 				setCart(initialCart);
// 			} catch (e) {
// 				console.error("Error parsing cart from URL:", e);
// 			}
// 		}
// 	}, [stateCart]);
//
// 	useEffect(() => {
// 		if (cart.length > 0) {
// 			localStorage.setItem("cart", JSON.stringify(cart));
// 		} else {
// 			localStorage.removeItem("cart");
// 		}
// 	}, [cart]);
//
// 	useEffect(() => {
// 		console.log("Product:", product);
// 		console.log("Product variants:", product.variants);
// 		console.log("Current selectedVariant:", selectedVariant);
// 		console.log(
// 			"Available variants:",
// 			product.variants?.map((v) => ({
// 				size: v.size,
// 				price: v.price,
// 				articul: v.articul,
// 			}))
// 		);
// 	}, [product, product.variants, selectedVariant]);
//
// 	const addToCart = (variant: ProductVariant) => {
// 		if (!variant) {
// 			console.error("No variant provided");
// 			return;
// 		}
//
// 		const cartItem: CartItem = {
// 			name: `${product.name} ${variant.size}`,
// 			price: variant.price,
// 			quantity: quantityToAdd,
// 			image: product.image,
// 			articul: variant.articul,
// 			size: variant.size,
// 		};
//
// 		const existingItem = cart.find(
// 			(cartItem) => cartItem.name === cartItem.name
// 		);
// 		if (existingItem) {
// 			setCart(
// 				cart.map((cartItem) =>
// 					cartItem.name === cartItem.name
// 						? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
// 						: cartItem
// 				)
// 			);
// 		} else {
// 			setCart([...cart, cartItem]);
// 		}
//
// 		console.log("Добавлено в корзину:", cartItem);
// 		setQuantityToAdd(1);
// 	};
//
// 	const calculate = (count: number, price: string) => {
// 		const clearPrice = parseFloat(price.replace(" Р", ""));
// 		return clearPrice * count;
// 	};
//
// 	const handleSizeClick = (variant: ProductVariant) => {
// 		setSelectedVariant(variant);
// 		addToCart(variant);
// 	};
//
// 	const existingItems = cart.filter((cartItem) =>
// 		cartItem.name.startsWith(`${product.name} `)
// 	);
//
// 	// Валидация
// 	if (!product.variants || product.variants.length === 0) {
// 		console.error("No variants available for", product.name);
// 		return <p className={css.error}>Размеры недоступны</p>;
// 	}
//
// 	// Проверка на одинаковые размеры
// 	const uniqueSizes = new Set(product.variants.map((v) => v.size));
// 	if (uniqueSizes.size === 1) {
// 		console.warn("All variants have the same size:", uniqueSizes);
// 	}
//
// 	return (
// 		<div className={css.productPage}>
// 			<button className={css.backBtn} onClick={() => router.back()}>
// 				{"<"}
// 			</button>
// 			<div>
// 				<div className={css.imageWrapper}>
// 					<Image
// 						className={css.image}
// 						src={product.image}
// 						alt={product.name}
// 						fill
// 					/>
// 				</div>
// 				<div className={css.content}>
// 					<div className={css.productText}>
// 						<p className={css.name}>{product.name}</p>
// 						<p className={css.cartDescription}>{product.description}</p>
// 						{selectedVariant && (
// 							<p className={css.cartDescription}>{selectedVariant.weight}</p>
// 						)}
// 					</div>
// 					<div className={css.sizeSelector}>
// 						<p>Выберите размер:</p>
// 						<div className={css.sizeButtons}>
// 							{product.variants.map((variant) => (
// 								<button
// 									key={variant.articul}
// 									className={`${css.sizeBtn} ${
// 										selectedVariant?.articul === variant.articul ? css.selected : ""
// 									}`}
// 									onClick={() => handleSizeClick(variant)}
// 								>
// 									{variant.size} - {variant.price}
// 								</button>
// 							))}
// 						</div>
// 					</div>
// 					{existingItems.length > 0 && (
// 						<div className={css.quantity}>
// 							<p className={css.quantityDescription}>В корзине</p>
// 							{existingItems.map((item) => (
// 								<p key={item.articul} className={css.quantityItem}>
// 									<span>{item.name}</span>
// 									<span>{item.quantity} шт</span>
// 								</p>
// 							))}
// 						</div>
// 					)}
// 				</div>
// 				<div className={css.quantityControls}>
// 					<div className={css.countWrapper}>
// 						<button
// 							className={css.countBtn}
// 							onClick={() => setQuantityToAdd(quantityToAdd - 1)}
// 							disabled={quantityToAdd <= 1}
// 						>
// 							-
// 						</button>
// 						<span className={css.countField}>{quantityToAdd}</span>
// 						<button
// 							className={css.countBtn}
// 							onClick={() => setQuantityToAdd(quantityToAdd + 1)}
// 						>
// 							+
// 						</button>
// 					</div>
// 					{selectedVariant && (
// 						<button
// 							className={css.priceBtn}
// 							onClick={() => addToCart(selectedVariant)}
// 						>
// 							{"Добавить " + calculate(quantityToAdd, selectedVariant.price) + " Р"}
// 						</button>
// 					)}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
//
// export default ProductPage;
