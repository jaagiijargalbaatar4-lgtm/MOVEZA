// Canvas setup
const introScreen =
  document.getElementById("intro-screen");

const introVideo =
  document.getElementById("intro-video");

const introStart =
  document.getElementById("intro-start");

const enterButton =
  document.getElementById("enter-button");

const skipIntro =
  document.getElementById("skip-intro");

const mainSite =
  document.getElementById("main-site");


// ENTER button

enterButton.addEventListener("click", async () => {

  introStart.style.display = "none";

  try {

    await introVideo.play();

  } catch (error) {

    console.error(
      "Video playback error:",
      error
    );

  }

});


// Video дуусахад Home page руу шилжинэ

introVideo.addEventListener("ended", () => {

  showMainSite();

});


// Skip Intro

skipIntro.addEventListener("click", () => {

  introVideo.pause();

  showMainSite();

});


function showMainSite() {

  introScreen.style.display = "none";

  mainSite.classList.add("show");

  window.scrollTo(0, 0);

}


// Skip Intro

skipIntro.addEventListener("click", () => {

  introVideo.pause();

  showMainSite();

});

const canvas = document.getElementById("tryon-canvas");
const ctx = canvas.getContext("2d");

const userImageInput = document.getElementById("user-image");
const clothesSelect = document.getElementById("clothes-select");
const tryButton = document.getElementById("try-button");

let userImage = new Image();
let clothesImage = new Image();

let clothesX = 100;
let clothesY = 150;
let clothesScale = 1;

let suggestedFiles = [];
let currentIndex = 0;

let suggestedColor = null;
let suggestedStyle = null;


// 画像を描画する

function drawImages() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let userDrawHeight = canvas.height;

  if (userImage.src) {

    const aspectRatio = userImage.height / userImage.width;

    userDrawHeight = canvas.width * aspectRatio;

    ctx.drawImage(
      userImage,
      0,
      0,
      canvas.width,
      userDrawHeight
    );
  }

  if (clothesImage.src) {

    ctx.drawImage(
      clothesImage,
      clothesX,
      clothesY,
      clothesImage.width * clothesScale,
      clothesImage.height * clothesScale
    );
  }

  if (suggestedColor) {

    ctx.fillStyle = suggestedColor;
    ctx.globalAlpha = 0.2;

    ctx.fillRect(
      clothesX,
      clothesY,
      clothesImage.width * clothesScale,
      clothesImage.height * clothesScale
    );

    ctx.globalAlpha = 1;
  }

  if (suggestedStyle) {

    ctx.font = "18px Arial";
    ctx.fillStyle = "#000";

    ctx.fillText(
      suggestedStyle,
      clothesX,
      clothesY - 10
    );
  }
}


// ユーザーが画像をアップロード

userImageInput.addEventListener("change", () => {

  const file = userImageInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {

    userImage.src = e.target.result;

    userImage.onload = drawImages;
  };

  reader.readAsDataURL(file);
});


// 試着ボタン

tryButton.addEventListener("click", () => {

  clothesImage.src = `images/${clothesSelect.value}`;

  clothesImage.onload = () => {

    autoScaleAndPosition();

    drawImages();
  };
});


// 自動的にサイズと位置を調整

function autoScaleAndPosition() {

  if (!userImage.src) return;

  const aspectRatio = userImage.height / userImage.width;

  const userDrawHeight = canvas.width * aspectRatio;

  const scaleWidth =
    canvas.width * 0.6 / clothesImage.width;

  const scaleHeight =
    userDrawHeight * 0.5 / clothesImage.height;

  clothesScale = Math.min(
    scaleWidth,
    scaleHeight
  );

  clothesX =
    (canvas.width - clothesImage.width * clothesScale) / 2;

  clothesY =
    userDrawHeight * 0.2;
}


// 上に移動

document.getElementById("move-up").onclick = () => {

  clothesY -= 10;

  drawImages();
};


// 下に移動

document.getElementById("move-down").onclick = () => {

  clothesY += 10;

  drawImages();
};


// 左に移動

document.getElementById("move-left").onclick = () => {

  clothesX -= 10;

  drawImages();
};


// 右に移動

document.getElementById("move-right").onclick = () => {

  clothesX += 10;

  drawImages();
};


// 拡大

document.getElementById("scale-up").onclick = () => {

  clothesScale += 0.1;

  drawImages();
};


// 縮小

document.getElementById("scale-down").onclick = () => {

  clothesScale =
    Math.max(0.1, clothesScale - 0.1);

  drawImages();
};


const aiButton =
  document.getElementById("ai-suggest");

const aiResult =
  document.getElementById("ai-result");


// AI Style Advisor
aiButton.addEventListener("click", async () => {
  aiResult.textContent = "AIが画像を分析しています... ⏳";

  const file = userImageInput.files[0];

  if (!file) {
    aiResult.textContent =
      "先に写真をアップロードしてください。";
    return;
  }

  const reader = new FileReader();

  reader.onload = async function () {
    const base64Image = reader.result.split(",")[1];

    try {
      // Gemini API Key
      const API_KEY = "(秘密)";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: file.type,
                      data: base64Image
                    }
                  },
                  {
                    text:
                      "この画像に写っている人物の雰囲気、肌の色、髪の色、全体的な印象を参考にして、似合うファッションスタイルを3つ提案してください。日本語で回答してください。それぞれ「スタイル名」と「おすすめカラー（HEX）」を含めてください。"
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      console.log("Gemini response:", data);

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
          "Gemini API request failed."
        );
      }

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        aiResult.textContent =
          "AIからおすすめを取得できませんでした。";
        return;
      }

      aiResult.textContent = text;

    } catch (error) {
      console.error("Gemini API Error:", error);

      aiResult.textContent =
        "⚠️ AIエラー: " + error.message;
    }
  };

  reader.readAsDataURL(file);
});
// AIが提案した服を読み込む

function loadSuggestedClothes(index) {

  const item =
    suggestedFiles[index];

  if (!item) return;

  const colorMatch =
    item.match(/#(?:[0-9a-fA-F]{6})/);

  suggestedColor =
    colorMatch
      ? colorMatch[0]
      : null;

  suggestedStyle =
    item.replace(colorMatch, "").trim();

  const suggestedFile =
    suggestedStyle
      .split(" ")[0]
      .toLowerCase() + ".png";

  clothesImage.src =
    `images/${suggestedFile}`;

  clothesImage.onload = () => {

    autoScaleAndPosition();

    drawImages();
  };
}


// ダブルクリックで前のおすすめへ

document.getElementById("move-left")
  .addEventListener("dblclick", () => {

    if (suggestedFiles.length === 0) return;

    currentIndex =
      (currentIndex - 1 + suggestedFiles.length)
      % suggestedFiles.length;

    loadSuggestedClothes(currentIndex);
  });


// ダブルクリックで次のおすすめへ

document.getElementById("move-right")
  .addEventListener("dblclick", () => {

    if (suggestedFiles.length === 0) return;

    currentIndex =
      (currentIndex + 1)
      % suggestedFiles.length;

    loadSuggestedClothes(currentIndex);
  });


let startX = 0;


// スマートフォンのスワイプ操作

canvas.addEventListener("touchstart", e => {

  startX =
    e.touches[0].clientX;
});


canvas.addEventListener("touchend", e => {

  const diff =
    e.changedTouches[0].clientX - startX;

  if (suggestedFiles.length === 0) return;

  if (diff > 50) {

    currentIndex =
      (currentIndex - 1 + suggestedFiles.length)
      % suggestedFiles.length;
  }

  if (diff < -50) {

    currentIndex =
      (currentIndex + 1)
      % suggestedFiles.length;
  }

  loadSuggestedClothes(currentIndex);
});
// ====================================
// CART SYSTEM
// ====================================

const cartButton = document.getElementById("cart-button");
const cartPanel = document.getElementById("cart-panel");
const closeCart = document.getElementById("close-cart");
const cartOverlay = document.getElementById("cart-overlay");

const cartItemsContainer =
    document.getElementById("cart-items");

const cartTotalElement =
    document.getElementById("cart-total");

const checkoutButton =
    document.getElementById("checkout-button");

let cart = [];


// PRODUCT DATA

const products = [
    {
        name: "White Shirt",
        price: 5900,
        image: "images/shirt1.png"
    },

    {
        name: "Orange Shirt",
        price: 6900,
        image: "images/shirt2.png"
    },

    {
        name: "Blue Shirt",
        price: 6900,
        image: "images/shirt3.png"
    },

    {
        name: "Essential Jacket",
        price: 8900,
        image: null
    }
];


// ADD TO CART

document.querySelectorAll(".add-cart-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const productName =
                button.dataset.product;

            addToCart(productName);

        });

    });


// ADD PRODUCT

function addToCart(productName) {

    const product =
        products.find(item =>
            item.name === productName
        );

    if (!product) return;

    const existingItem =
        cart.find(item =>
            item.name === productName
        );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    updateCart();

    openCart();
}


// UPDATE CART

function updateCart() {

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        cartTotalElement.textContent = "¥0";

        updateCartCount();

        return;
    }


    let total = 0;


    cart.forEach((item, index) => {

        total += item.price * item.quantity;


        const cartItem =
            document.createElement("div");

        cartItem.className = "cart-item";


        cartItem.innerHTML = `

            ${
                item.image
                ? `<img
                    class="cart-item-image"
                    src="${item.image}"
                    alt="${item.name}"
                >`
                : `
                <div class="cart-item-image">
                    MOVEZA
                </div>
                `
            }

            <div class="cart-item-info">

                <h3>
                    ${item.name}
                </h3>

                <div class="cart-item-price">
                    ¥${item.price.toLocaleString()}
                </div>

                <div class="quantity-controls">

                    <button
                        onclick="decreaseQuantity(${index})">
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="increaseQuantity(${index})">
                        +
                    </button>

                    <button
                        class="remove-item"
                        onclick="removeFromCart(${index})">
                        REMOVE
                    </button>

                </div>

            </div>
        `;


        cartItemsContainer.appendChild(cartItem);

    });


    cartTotalElement.textContent =
        `¥${total.toLocaleString()}`;

    updateCartCount();
}


// INCREASE

function increaseQuantity(index) {

    cart[index].quantity++;

    updateCart();
}


// DECREASE

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }

    updateCart();
}


// REMOVE

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();
}


// CART COUNT

function updateCartCount() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    let countElement =
        document.querySelector(".cart-count");


    if (!countElement) {

        countElement =
            document.createElement("span");

        countElement.className =
            "cart-count";

        cartButton.appendChild(countElement);
    }


    countElement.textContent = count;


    if (count === 0) {

        countElement.style.display = "none";

    } else {

        countElement.style.display = "flex";

    }

}


// OPEN CART

function openCart() {

    cartPanel.classList.add("active");

    cartOverlay.classList.add("active");
}


// CLOSE CART

function closeCartPanel() {

    cartPanel.classList.remove("active");

    cartOverlay.classList.remove("active");
}


cartButton.addEventListener(
    "click",
    openCart
);


closeCart.addEventListener(
    "click",
    closeCartPanel
);


cartOverlay.addEventListener(
    "click",
    closeCartPanel
);


// CHECKOUT

checkoutButton.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            alert("Your cart is empty.");

            return;
        }

        alert(
            "Thank you for shopping with MOVEZA!"
        );

    }
);
// ====================================
// PRODUCT SEARCH & FILTER
// ====================================

const productSearch =
    document.getElementById("product-search");

const clearSearch =
    document.getElementById("clear-search");

const filterButtons =
    document.querySelectorAll(".filter-button");

const productCards =
    document.querySelectorAll(".product-card");

const productsGrid =
    document.querySelector(".products-grid");

let currentFilter = "all";


// SEARCH

productSearch.addEventListener(
    "input",
    () => {

        const searchText =
            productSearch.value
                .toLowerCase()
                .trim();


        if (searchText.length > 0) {

            clearSearch.style.display =
                "block";

        } else {

            clearSearch.style.display =
                "none";
        }


        filterProducts();

    }
);


// CLEAR SEARCH

clearSearch.addEventListener(
    "click",
    () => {

        productSearch.value = "";

        clearSearch.style.display =
            "none";

        filterProducts();

    }
);


// FILTER BUTTONS

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(
                item =>
                    item.classList.remove("active")
            );

            button.classList.add("active");

            currentFilter =
                button.dataset.filter;

            filterProducts();

        }
    );

});


// FILTER FUNCTION

function filterProducts() {

    const searchText =
        productSearch.value
            .toLowerCase()
            .trim();


    let visibleProducts = 0;


    productCards.forEach(card => {

        const productName =
            card
                .querySelector("h3")
                .textContent
                .toLowerCase();


        const category =
            card.dataset.category;


        const matchesSearch =
            productName.includes(searchText);


        const matchesFilter =
            currentFilter === "all" ||
            category === currentFilter;


        if (
            matchesSearch &&
            matchesFilter
        ) {

            card.style.display = "";

            visibleProducts++;

        } else {

            card.style.display = "none";

        }

    });


    showNoProductsMessage(
        visibleProducts === 0
    );

}


// NO PRODUCTS MESSAGE

function showNoProductsMessage(show) {

    let message =
        document.querySelector(".no-products");


    if (show) {

        if (!message) {

            message =
                document.createElement("div");

            message.className =
                "no-products";

            message.textContent =
                "No products found.";

            productsGrid.appendChild(
                message
            );
        }

    } else {

        if (message) {

            message.remove();

        }

    }

}