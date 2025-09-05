const data = require("./data.json");
console.log(data);

const createProduct  = async (data) => {
    try {
        const res = await fetch("http://localhost:3900/api/v1/products",
            {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "content-type": "application/json"
                }
            }
        )
        const result = await res.json();
        if (res.status != 201) {
            console.log("-----Product not created-----");
            console.log(result.message);
        }
    }

    catch (err) {
        console.log("----Error creating products---", err.message);
        console.log("----Error creating products---", err.message);

    }
}

const createProductMigration = async () => {
    const { products } = data;
    for (let i = 0; i < products.length; i++) {
        const prouctData = products[i];
        prouctData.price = Math.round(prouctData.price * 80);//converting doller into rupees
        await createProduct (prouctData);
        console.log("Product created...", i + 1);
    }
}

createProductMigration();
