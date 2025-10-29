const { validateObjectId } = require("../../../utils/validateObjectId");

const createProductValidator = (req, res, next) => {
    try {
        console.log("----Inside createProductValidator----");
        const { title, price, description, quantity, categoryId } = req.body;

        // Quantity validation
        if (quantity && quantity < 0) {
            return res.status(400).json({
                isSuccess: false,
                message: "Quantity should be >= 0",
                data: {}
            });
        }

        // Price validation
        if (!price || price < 1) {
            return res.status(400).json({
                isSuccess: false,
                message: "Price should be > 1",
                data: {}
            });
        }

        // Title validation
        if (!title || title.length <= 2) {
            return res.status(400).json({
                isSuccess: false,
                message: "Title length must be > 2",
                data: {}
            });
        }

        // Description validation
        if (description && description.length < 5) {
            return res.status(400).json({
                isSuccess: false,
                message: "Description is too short",
                data: {}
            });
        }

        // Category validation
        if (!categoryId) {
            return res.status(400).json({
                isSuccess: false,
                message: "Category is required",
                data: {}
            });
        }

        // optionally check if categoryId is a valid ObjectId / integer
        // if (typeof categoryId !== "number") { ... }  OR mongoose.isValidObjectId(categoryId)

        next();
    } catch (err) {
        console.error("----Error Inside createProductValidator---->", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
            data: {}
        });
    }
};


const allowedCategories = [
  "womens-dresses",
  "womens-jewellery",
  "beauty",
  "womens-watches",
  "womens-shoes",
  "womens-bags",
  "motorcycle",
  "groceries",
  "furniture",
  "sports-accessories",
  "laptops",
  "smartphone", // if you have these in frontend
];

const listProductValidator = (req, res, next) => {
  try {
    const { limit, page, category, minPrice, maxPrice } = req.query;

    // ---- Validate limit ----
    if (limit && (isNaN(limit) || Number(limit) <= 0)) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid 'limit' value — must be a positive number",
      });
    }

    // ---- Validate page ----
    if (page && (isNaN(page) || Number(page) <= 0)) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid 'page' value — must be a positive number",
      });
    }

    // ---- Validate and sanitize categories ----
    let categoryArray = [];
    if (category) {
      categoryArray = category
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);

      const invalidCategory = categoryArray.find(
        (c) => !allowedCategories.includes(c)
      );
      if (invalidCategory) {
        return res.status(400).json({
          isSuccess: false,
          message: `Invalid category '${invalidCategory}'. Allowed: ${allowedCategories.join(", ")}`,
        });
      }
    }

    // ---- Validate prices ----
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    if ((minPrice && isNaN(min)) || (maxPrice && isNaN(max))) {
      return res.status(400).json({
        isSuccess: false,
        message: "'minPrice' and 'maxPrice' must be valid numbers",
      });
    }

    if (min !== null && max !== null && min > max) {
      return res.status(400).json({
        isSuccess: false,
        message: "'minPrice' cannot be greater than 'maxPrice'",
      });
    }

    // ---- Attach normalized values ----
    req.query.limitNum = Math.min(Math.max(Number(limit) || 5, 1), 30);
    req.query.pageNum = Math.max(parseInt(page) || 1, 1);
    req.query.categoryArray = categoryArray;
    req.query.minPriceNum = min;
    req.query.maxPriceNum = max;

    next();
  } catch (err) {
    console.error("Error in listProductValidator:", err);
    res.status(500).json({
      isSuccess: false,
      message: "Internal server error in listProductValidator",
      error: err.message,
    });
  }
};

const updateProductValidator = (req, res, next) => {
    console.log("------Inside the UPDATE product validator--------");
    try {
        const { title, price, discription, quantity } = req.body;
        // title validation
        if (!title || title.length <= 2) {
            return res.status(400).json({
                isSuccess: false,
                message: "title length must be > 2",
                data: {}
            });
        }

        // quantity validation
        if (quantity && quantity < 0) {
            res.status(400).json({
                isSuccess: false,
                message: "quantity should be > 0 ",
                data: {}
            });
            return;
        }

        if (price || price < 1) {
            res.status(400).json({
                isSuccess: false,
                message: "price should be > 1",
                data: {}
            });
            return;
        }

        if (discription && discription.length < 5) {
            return res.status(400).json({
                isSuccess: false,
                message: "Description is too short",
                data: {}
            });
        }

        next();
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Validation error",
            err: err.message
        });
    }
};

const viewProductValidator = (req, res, next) => {
    console.log("------Inside the viewProductValidator--------");
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                isSuccess: false,
                message: "Product Id not found",
            });
            return;
        }
        if (!validateObjectId(id, res)) return;
        next();

    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Validation error",
            err: err.message
        });
    }
};





module.exports = { listProductValidator, createProductValidator, updateProductValidator, viewProductValidator };
