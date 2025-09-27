const express = require("express");
const router = express.Router();
const categoriesModel = require("../Models/Categories/CategoriesModel.js");

// get all categories

router.get("/getAllCategories", async (req, res) => {
  try {
    const result = await categoriesModel.find({});
    res.send({
      statusCode: 200,
      value: result,
      errors: [],
    });
  } catch (err) {
    res.status(500).send({
      statusCode: 500,
      value: [],
      errors: [err.message],
    });
  }
});

// add new category

router.post("/addCategory", async (req, res) => {
  const { categoryName, price } = req.body;

  try {
    const caterory = new categoriesModel({
      categoryName: categoryName,
      price: price,
    });

    await caterory.save();
    res.send({
      statusCode: 200,
      value: ["Category added successfully"],
      errors: [],
    });
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

//update category

router.patch("/updateCategory", async (req, res) => {
  const { id, categoryName, price } = req.body;
  try {
    const result = await categoriesModel.findByIdAndUpdate(
      id,
      {
        categoryName: categoryName,
        price: price,
      },
      {
        new: true,
      }
    );

    if (!result) {
      return res.status(404).send({
        statusCode: 404,
        value: [],
        errors: ["Category not found"],
      });
    }

    return res.send({
      statusCode: 200,
      value: [result],
      errors: [],
    });
  } catch (err) {
    res.status(404).send({
      statusCode: 500,
      value: [],
      errors: [err.message],
    });
  }
});

// delete category

router.delete("/deleteCategory/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await categoriesModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).send({
        statusCode: 404,
        value: [],
        errors: ["Category not found"],
      });
    }
    return res.send({
      statusCode: 200,
      value: [result],
      errors: [],
    });
  } catch (err) {
    res.status(500).send({
      statusCode: 500,
      value: [],
      errors: [err.message],
    });
  }
});
module.exports = router;
