fetch("https://dummyjson.com/products")
    .then(response => response.json())
    .then(data => {
        console.log(data.products);
        const newArray = data.products.map(item => {
            return `<li>${item.title}</li>`;
        });
        const htmls = newArray.join("");

        const productList = document.querySelector("#product-list");

        productList.innerHTML = htmls;

        console.log(newArray);
    })
    .catch(error => console.error("Error fetching products:", error));