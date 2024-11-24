// import fs from "node:fs";

// import sql from "better-sqlite3";
// import slugify from "slugify";
// import xss from "xss";

// const db = sql("meals.db");

// export async function getMeals() {
//   await new Promise((resolve) => setTimeout(resolve, 5000));

//   // throw new Error('Loading meals failed');
//   return db.prepare("SELECT * FROM meals").all();
// }

// export function getMeal(slug) {
//   return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
// }

// export async function saveMeal(meal) {
//   meal.slug = slugify(meal.title, { lower: true });
//   meal.instructions = xss(meal.instructions);

//   const extension = meal.image.name.split(".").pop();
//   const fileName = `${meal.slug}.${extension}`;

//   const stream = fs.createWriteStream(`public/images/${fileName}`);
//   const bufferedImage = await meal.image.arrayBuffer();

//   stream.write(Buffer.from(bufferedImage), (error) => {
//     if (error) {
//       throw new error("Saving image failed!");
//     }
//   });

//   meal.image = `/images/${fileName}`;

//   db.prepare(
//     `
//         INSERT INTO meals
//         (title, summary, instructions, creator, creator_email, image, slug)
//         values (
//         @title, @summary, @instructions, @creator, @creator_email, @image, @slug
//         )
//         `
//   ).run(meal);
// }

import fs from "node:fs";
import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";

const db = sql("meals.db");

function ensureDirectoryExistence(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function getMeals() {
  try {

    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    return db.prepare("SELECT * FROM meals").all();
  } catch (error) {
    console.error("Error fetching meals:", error);
    throw new Error("Failed to fetch meals.");
  }
}

export function getMeal(slug) {
  try {
    return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
  } catch (error) {
    console.error("Error fetching meal by slug:", error);
    throw new Error("Failed to fetch meal.");
  }
}

export async function saveMeal(meal) {
  try {
    if (!meal.title) {
      throw new Error("Meal title is required.");
    }

    meal.slug = slugify(meal.title, { lower: true });
    meal.instructions = xss(meal.instructions);

    if (!meal.image?.name) {
      throw new Error("Meal image is required.");
    }

    const extension = meal.image.name.split(".").pop();
    const fileName = `${meal.slug}.${extension}`;
    const filePath = `public/images/${fileName}`;

    ensureDirectoryExistence("public/images/");

    const stream = fs.createWriteStream(filePath);

    const bufferedImage = await meal.image.arrayBuffer();
    stream.write(Buffer.from(bufferedImage));
    stream.end();

    meal.image = `/images/${fileName}`;

    db.prepare(
      `
      INSERT INTO meals
      (title, summary, instructions, creator, creator_email, image, slug)
      VALUES
      (@title, @summary, @instructions, @creator, @creator_email, @image, @slug)
      `
    ).run(meal);
  } catch (error) {
    console.error("Error saving meal:", error);
    throw new Error("Failed to save meal.");
  }
}
