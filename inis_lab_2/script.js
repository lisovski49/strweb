document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("products-container");

    if (!Array.isArray(shirts) || shirts.length === 0) {
        console.error("Ошибка: Данные о футболках не найдены или пусты.");
        return;
    }

    shirts.forEach(shirt => {
        try {
            const card = document.createElement("div");
            card.classList.add("product-card");

            const img = document.createElement("img");
            const defaultImage = shirt.default?.back || "placeholder.jpg";
            const firstColor = Object.values(shirt.colors || {})[0];
            img.src = firstColor?.front || defaultImage;
            img.alt = shirt.name || "No name";
            img.onerror = () => img.src = "placeholder.jpg";

            const title = document.createElement("h3");
            title.textContent = shirt.name || "Без названия";

            const description = document.createElement("p");
            description.textContent = shirt.description || "Описание отсутствует";

            const price = document.createElement("p");
            price.textContent = shirt.price || "Цена не указана";

            const button = document.createElement("button");
            button.textContent = "See Page";
            button.classList.add("see-page-button");

            card.appendChild(img);
            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(price);
            card.appendChild(button);

            productsContainer.appendChild(card);
        } catch (error) {
            console.error("Ошибка при создании карточки товара:", error);
        }
    });
});