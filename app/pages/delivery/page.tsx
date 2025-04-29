"use client";

import { Suspense } from "react";
import Cart from "@/app/components/cart/cart";
import Delivery from "@/app/components/delivery/delivery";

const DeliveryPage = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Delivery />
		</Suspense>
	);
};

export default DeliveryPage;
