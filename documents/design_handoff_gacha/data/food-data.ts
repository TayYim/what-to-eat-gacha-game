// food-data.ts — single source of truth for the "What-to-eat Gacha" content.
// 18 categories, 126 dishes.
// Rarity → gacha weight: R(3)=94, SR(4)=5, SSR(5)=1  (lower rarity = far more common)

export type Rarity = 3 | 4 | 5; // 3=R 优良, 4=SR 稀有, 5=SSR 传说
export type TierCode = 'R' | 'SR' | 'SSR';

export interface Category {
  id: string;
  name: string;   // Chinese display name
  color: string;  // hex, used for chips + wheel slice
}

export interface Food {
  id: string;     // stable kebab-case slug
  name: string;   // Chinese display name
  cat: string;    // Category.id
  r: Rarity;
}

export const CATEGORIES: Category[] = [
  {
    "id": "breakfast",
    "name": "早餐早点",
    "color": "#ffb020"
  },
  {
    "id": "rice",
    "name": "米饭便当",
    "color": "#f6c445"
  },
  {
    "id": "chinese",
    "name": "中式菜系",
    "color": "#ff5a3d"
  },
  {
    "id": "noodle",
    "name": "粉面馄饨",
    "color": "#00d9ff"
  },
  {
    "id": "dumpling",
    "name": "饺子包点",
    "color": "#7ed957"
  },
  {
    "id": "malatang",
    "name": "麻辣烫冒菜",
    "color": "#ff3b6b"
  },
  {
    "id": "hotpot",
    "name": "火锅香锅",
    "color": "#e01e5a"
  },
  {
    "id": "grill",
    "name": "烧烤烤肉",
    "color": "#ff7a18"
  },
  {
    "id": "fast",
    "name": "汉堡炸鸡",
    "color": "#f7e94d"
  },
  {
    "id": "western",
    "name": "西餐披萨",
    "color": "#4ca3ff"
  },
  {
    "id": "jpkr",
    "name": "日韩料理",
    "color": "#b46cff"
  },
  {
    "id": "light",
    "name": "轻食健康餐",
    "color": "#45d483"
  },
  {
    "id": "soup",
    "name": "粥汤炖品",
    "color": "#35c2a1"
  },
  {
    "id": "seafood",
    "name": "海鲜河鲜",
    "color": "#2dd4bf"
  },
  {
    "id": "snack",
    "name": "小吃夜宵",
    "color": "#ff4dd8"
  },
  {
    "id": "drink",
    "name": "茶饮咖啡",
    "color": "#44ffd2"
  },
  {
    "id": "dessert",
    "name": "甜品烘焙",
    "color": "#ff8ad8"
  },
  {
    "id": "fruit",
    "name": "水果轻补",
    "color": "#8fd14f"
  }
];

export const FOODS: Food[] = [
  {
    "id": "mixed-grain-congee-egg",
    "name": "杂粮粥配鸡蛋",
    "cat": "breakfast",
    "r": 3
  },
  {
    "id": "oat-yogurt-cup",
    "name": "燕麦酸奶杯",
    "cat": "breakfast",
    "r": 3
  },
  {
    "id": "soy-milk-wholewheat-bun",
    "name": "豆浆全麦包",
    "cat": "breakfast",
    "r": 3
  },
  {
    "id": "egg-vegetable-sandwich",
    "name": "鸡蛋蔬菜三明治",
    "cat": "breakfast",
    "r": 4
  },
  {
    "id": "jianbing-guozi",
    "name": "煎饼果子",
    "cat": "breakfast",
    "r": 4
  },
  {
    "id": "youtiao-soy-milk",
    "name": "油条配豆浆",
    "cat": "breakfast",
    "r": 5
  },
  {
    "id": "huangmenji-rice",
    "name": "黄焖鸡米饭",
    "cat": "rice",
    "r": 4
  },
  {
    "id": "tomato-beef-brisket-rice",
    "name": "番茄牛腩饭",
    "cat": "rice",
    "r": 4
  },
  {
    "id": "steamed-fish-set",
    "name": "清蒸鱼套餐",
    "cat": "rice",
    "r": 3
  },
  {
    "id": "poached-chicken-leg-rice",
    "name": "白灼鸡腿饭",
    "cat": "rice",
    "r": 3
  },
  {
    "id": "curry-chicken-rice",
    "name": "咖喱鸡肉饭",
    "cat": "rice",
    "r": 4
  },
  {
    "id": "braised-pork-rice",
    "name": "卤肉饭",
    "cat": "rice",
    "r": 5
  },
  {
    "id": "stir-fried-pork-rice",
    "name": "小炒肉盖饭",
    "cat": "rice",
    "r": 4
  },
  {
    "id": "jiangzhe-steamed-fish",
    "name": "江浙清蒸鱼",
    "cat": "chinese",
    "r": 3
  },
  {
    "id": "cantonese-poached-chicken",
    "name": "粤式白切鸡",
    "cat": "chinese",
    "r": 3
  },
  {
    "id": "tomato-scrambled-egg-set",
    "name": "番茄炒蛋套餐",
    "cat": "chinese",
    "r": 3
  },
  {
    "id": "hunan-beef-stir-fry",
    "name": "小炒黄牛肉",
    "cat": "chinese",
    "r": 4
  },
  {
    "id": "xinjiang-big-plate-chicken",
    "name": "大盘鸡",
    "cat": "chinese",
    "r": 5
  },
  {
    "id": "di-san-xian",
    "name": "地三鲜",
    "cat": "chinese",
    "r": 5
  },
  {
    "id": "double-cooked-pork",
    "name": "回锅肉",
    "cat": "chinese",
    "r": 5
  },
  {
    "id": "tomato-egg-noodles",
    "name": "番茄鸡蛋面",
    "cat": "noodle",
    "r": 3
  },
  {
    "id": "clear-broth-beef-noodles",
    "name": "清汤牛肉面",
    "cat": "noodle",
    "r": 4
  },
  {
    "id": "wonton-noodles",
    "name": "云吞面",
    "cat": "noodle",
    "r": 4
  },
  {
    "id": "buckwheat-cold-noodles",
    "name": "荞麦冷面",
    "cat": "noodle",
    "r": 3
  },
  {
    "id": "guilin-rice-noodles",
    "name": "桂林米粉",
    "cat": "noodle",
    "r": 4
  },
  {
    "id": "hot-sour-rice-noodles",
    "name": "酸辣粉",
    "cat": "noodle",
    "r": 5
  },
  {
    "id": "cross-bridge-rice-noodles",
    "name": "过桥米线",
    "cat": "noodle",
    "r": 4
  },
  {
    "id": "vegetable-dumplings",
    "name": "素三鲜水饺",
    "cat": "dumpling",
    "r": 3
  },
  {
    "id": "shrimp-dumplings",
    "name": "虾仁水饺",
    "cat": "dumpling",
    "r": 3
  },
  {
    "id": "pork-cabbage-dumplings",
    "name": "猪肉白菜水饺",
    "cat": "dumpling",
    "r": 4
  },
  {
    "id": "beef-buns",
    "name": "牛肉包子",
    "cat": "dumpling",
    "r": 4
  },
  {
    "id": "soup-dumplings",
    "name": "鲜肉小笼包",
    "cat": "dumpling",
    "r": 4
  },
  {
    "id": "pan-fried-dumplings",
    "name": "煎饺",
    "cat": "dumpling",
    "r": 5
  },
  {
    "id": "shengjian-buns",
    "name": "生煎包",
    "cat": "dumpling",
    "r": 5
  },
  {
    "id": "clear-vegetable-tofu-malatang",
    "name": "清汤蔬菜豆腐烫",
    "cat": "malatang",
    "r": 4
  },
  {
    "id": "tomato-vegetable-malatang",
    "name": "番茄汤蔬菜烫",
    "cat": "malatang",
    "r": 4
  },
  {
    "id": "bone-broth-malatang",
    "name": "骨汤麻辣烫",
    "cat": "malatang",
    "r": 4
  },
  {
    "id": "spicy-maocai",
    "name": "麻辣冒菜",
    "cat": "malatang",
    "r": 5
  },
  {
    "id": "malaxiangguo",
    "name": "麻辣香锅",
    "cat": "malatang",
    "r": 5
  },
  {
    "id": "hot-sour-tangfen",
    "name": "酸辣烫粉",
    "cat": "malatang",
    "r": 5
  },
  {
    "id": "beef-maocai",
    "name": "牛肉冒菜",
    "cat": "malatang",
    "r": 5
  },
  {
    "id": "mushroom-broth-pot",
    "name": "菌汤锅套餐",
    "cat": "hotpot",
    "r": 4
  },
  {
    "id": "tomato-pot-set",
    "name": "番茄锅套餐",
    "cat": "hotpot",
    "r": 4
  },
  {
    "id": "beef-hotpot",
    "name": "牛肉火锅",
    "cat": "hotpot",
    "r": 5
  },
  {
    "id": "lamb-shabu-pot",
    "name": "羊肉涮锅",
    "cat": "hotpot",
    "r": 5
  },
  {
    "id": "tripe-hotpot-set",
    "name": "毛肚锅套餐",
    "cat": "hotpot",
    "r": 5
  },
  {
    "id": "sour-cabbage-fish-pot",
    "name": "酸菜鱼锅",
    "cat": "hotpot",
    "r": 5
  },
  {
    "id": "fatty-beef-dry-pot",
    "name": "肥牛香锅",
    "cat": "hotpot",
    "r": 5
  },
  {
    "id": "roasted-chicken-leg-rice",
    "name": "烤鸡腿饭",
    "cat": "grill",
    "r": 4
  },
  {
    "id": "roasted-vegetable-platter",
    "name": "烤蔬菜拼盘",
    "cat": "grill",
    "r": 4
  },
  {
    "id": "roasted-tofu",
    "name": "烤豆腐",
    "cat": "grill",
    "r": 4
  },
  {
    "id": "grilled-fish",
    "name": "烤鱼",
    "cat": "grill",
    "r": 5
  },
  {
    "id": "lamb-skewers",
    "name": "烤羊肉串",
    "cat": "grill",
    "r": 5
  },
  {
    "id": "grilled-pork-belly",
    "name": "烤五花肉",
    "cat": "grill",
    "r": 5
  },
  {
    "id": "grilled-meat-bibimbap",
    "name": "烤肉拌饭",
    "cat": "grill",
    "r": 4
  },
  {
    "id": "grilled-chicken-burger",
    "name": "烤鸡肉汉堡",
    "cat": "fast",
    "r": 4
  },
  {
    "id": "chicken-wrap",
    "name": "鸡肉卷",
    "cat": "fast",
    "r": 4
  },
  {
    "id": "vegetable-sandwich-set",
    "name": "蔬菜三明治套餐",
    "cat": "fast",
    "r": 3
  },
  {
    "id": "beef-burger",
    "name": "牛肉汉堡",
    "cat": "fast",
    "r": 5
  },
  {
    "id": "double-cheese-burger",
    "name": "双层芝士汉堡",
    "cat": "fast",
    "r": 5
  },
  {
    "id": "fried-chicken-leg-set",
    "name": "炸鸡腿套餐",
    "cat": "fast",
    "r": 5
  },
  {
    "id": "fries-snack",
    "name": "薯条小食",
    "cat": "fast",
    "r": 5
  },
  {
    "id": "vegetable-tomato-pasta",
    "name": "蔬菜番茄意面",
    "cat": "western",
    "r": 3
  },
  {
    "id": "chicken-breast-pasta",
    "name": "鸡胸肉意面",
    "cat": "western",
    "r": 4
  },
  {
    "id": "tomato-meat-sauce-pasta",
    "name": "番茄肉酱意面",
    "cat": "western",
    "r": 4
  },
  {
    "id": "steak-with-vegetables",
    "name": "牛排配蔬菜",
    "cat": "western",
    "r": 4
  },
  {
    "id": "mushroom-soup-bread",
    "name": "蘑菇浓汤配面包",
    "cat": "western",
    "r": 4
  },
  {
    "id": "margherita-pizza",
    "name": "玛格丽特披萨",
    "cat": "western",
    "r": 5
  },
  {
    "id": "seafood-pizza",
    "name": "海鲜披萨",
    "cat": "western",
    "r": 5
  },
  {
    "id": "sushi-platter",
    "name": "寿司拼盘",
    "cat": "jpkr",
    "r": 4
  },
  {
    "id": "sashimi-rice-bowl",
    "name": "刺身盖饭",
    "cat": "jpkr",
    "r": 3
  },
  {
    "id": "seaweed-rice-ball",
    "name": "海苔饭团",
    "cat": "jpkr",
    "r": 4
  },
  {
    "id": "bibimbap",
    "name": "石锅拌饭",
    "cat": "jpkr",
    "r": 4
  },
  {
    "id": "kimchi-soup-rice",
    "name": "泡菜汤饭",
    "cat": "jpkr",
    "r": 5
  },
  {
    "id": "tonkotsu-ramen",
    "name": "豚骨拉面",
    "cat": "jpkr",
    "r": 5
  },
  {
    "id": "army-stew",
    "name": "部队锅",
    "cat": "jpkr",
    "r": 5
  },
  {
    "id": "grilled-eel-rice",
    "name": "烤鳗鱼饭",
    "cat": "jpkr",
    "r": 4
  },
  {
    "id": "chicken-breast-salad",
    "name": "鸡胸肉沙拉",
    "cat": "light",
    "r": 3
  },
  {
    "id": "quinoa-avocado-bowl",
    "name": "藜麦牛油果碗",
    "cat": "light",
    "r": 3
  },
  {
    "id": "grain-vegetable-bowl",
    "name": "杂粮饭蔬菜碗",
    "cat": "light",
    "r": 3
  },
  {
    "id": "salmon-vegetable-salad",
    "name": "三文鱼蔬菜沙拉",
    "cat": "light",
    "r": 3
  },
  {
    "id": "lean-beef-power-bowl",
    "name": "低脂牛肉能量碗",
    "cat": "light",
    "r": 3
  },
  {
    "id": "yogurt-oat-energy-bowl",
    "name": "酸奶燕麦能量碗",
    "cat": "light",
    "r": 3
  },
  {
    "id": "pumpkin-millet-congee",
    "name": "南瓜小米粥",
    "cat": "soup",
    "r": 3
  },
  {
    "id": "kelp-tofu-soup",
    "name": "海带豆腐汤",
    "cat": "soup",
    "r": 3
  },
  {
    "id": "mushroom-chicken-soup",
    "name": "菌菇鸡汤",
    "cat": "soup",
    "r": 3
  },
  {
    "id": "preserved-egg-pork-congee",
    "name": "皮蛋瘦肉粥",
    "cat": "soup",
    "r": 4
  },
  {
    "id": "winter-melon-rib-soup",
    "name": "冬瓜排骨汤",
    "cat": "soup",
    "r": 4
  },
  {
    "id": "tremella-lotus-soup",
    "name": "银耳莲子羹",
    "cat": "soup",
    "r": 4
  },
  {
    "id": "tomato-beef-brisket-soup",
    "name": "番茄牛腩汤",
    "cat": "soup",
    "r": 4
  },
  {
    "id": "steamed-bass",
    "name": "清蒸鲈鱼",
    "cat": "seafood",
    "r": 3
  },
  {
    "id": "poached-shrimp",
    "name": "白灼虾",
    "cat": "seafood",
    "r": 3
  },
  {
    "id": "tomato-fish-slices",
    "name": "番茄鱼片",
    "cat": "seafood",
    "r": 4
  },
  {
    "id": "garlic-vermicelli-scallop",
    "name": "蒜蓉粉丝蒸扇贝",
    "cat": "seafood",
    "r": 4
  },
  {
    "id": "spicy-crayfish",
    "name": "香辣小龙虾",
    "cat": "seafood",
    "r": 5
  },
  {
    "id": "salt-pepper-shrimp",
    "name": "椒盐虾",
    "cat": "seafood",
    "r": 5
  },
  {
    "id": "sour-cabbage-fish",
    "name": "酸菜鱼",
    "cat": "seafood",
    "r": 5
  },
  {
    "id": "oden",
    "name": "关东煮",
    "cat": "snack",
    "r": 4
  },
  {
    "id": "roujiamo",
    "name": "肉夹馍",
    "cat": "snack",
    "r": 4
  },
  {
    "id": "liangpi",
    "name": "凉皮",
    "cat": "snack",
    "r": 4
  },
  {
    "id": "braised-snack-platter",
    "name": "卤味拼盘",
    "cat": "snack",
    "r": 5
  },
  {
    "id": "fried-stinky-tofu",
    "name": "臭豆腐",
    "cat": "snack",
    "r": 5
  },
  {
    "id": "fried-skewer-platter",
    "name": "炸串拼盘",
    "cat": "snack",
    "r": 5
  },
  {
    "id": "griddle-cold-noodles",
    "name": "烤冷面",
    "cat": "snack",
    "r": 5
  },
  {
    "id": "potstickers",
    "name": "锅贴",
    "cat": "snack",
    "r": 5
  },
  {
    "id": "unsweetened-americano",
    "name": "无糖美式咖啡",
    "cat": "drink",
    "r": 3
  },
  {
    "id": "unsweetened-green-tea",
    "name": "无糖绿茶",
    "cat": "drink",
    "r": 3
  },
  {
    "id": "hot-latte",
    "name": "热拿铁",
    "cat": "drink",
    "r": 4
  },
  {
    "id": "soy-latte",
    "name": "豆乳拿铁",
    "cat": "drink",
    "r": 4
  },
  {
    "id": "fruit-tea",
    "name": "水果茶",
    "cat": "drink",
    "r": 5
  },
  {
    "id": "pearl-milk-tea",
    "name": "珍珠奶茶",
    "cat": "drink",
    "r": 5
  },
  {
    "id": "cheese-foam-tea",
    "name": "奶盖茶",
    "cat": "drink",
    "r": 5
  },
  {
    "id": "sour-plum-drink",
    "name": "酸梅汤",
    "cat": "drink",
    "r": 5
  },
  {
    "id": "whole-wheat-bagel",
    "name": "全麦贝果",
    "cat": "dessert",
    "r": 4
  },
  {
    "id": "plain-yogurt-cup",
    "name": "原味酸奶杯",
    "cat": "dessert",
    "r": 3
  },
  {
    "id": "red-bean-milk-pudding",
    "name": "红豆双皮奶",
    "cat": "dessert",
    "r": 5
  },
  {
    "id": "egg-tart",
    "name": "蛋挞",
    "cat": "dessert",
    "r": 5
  },
  {
    "id": "cream-cake",
    "name": "奶油蛋糕",
    "cat": "dessert",
    "r": 5
  },
  {
    "id": "cream-puff",
    "name": "泡芙",
    "cat": "dessert",
    "r": 5
  },
  {
    "id": "chocolate-brownie",
    "name": "巧克力布朗尼",
    "cat": "dessert",
    "r": 5
  },
  {
    "id": "cut-fruit-box",
    "name": "鲜切水果盒",
    "cat": "fruit",
    "r": 3
  },
  {
    "id": "banana-oat-cup",
    "name": "香蕉燕麦杯",
    "cat": "fruit",
    "r": 3
  },
  {
    "id": "corn-sweet-potato-combo",
    "name": "玉米红薯拼",
    "cat": "fruit",
    "r": 3
  },
  {
    "id": "boiled-egg-fruit-meal",
    "name": "水煮蛋水果餐",
    "cat": "fruit",
    "r": 3
  },
  {
    "id": "plain-yogurt-fruit-cup",
    "name": "原味酸奶水果杯",
    "cat": "fruit",
    "r": 3
  },
  {
    "id": "honey-yogurt-cup",
    "name": "蜂蜜酸奶杯",
    "cat": "fruit",
    "r": 4
  }
];

export const rarityWeight = (r: number): number => (r >= 5 ? 1 : r >= 4 ? 5 : 94);

export const tierCode = (r: number): TierCode => (r >= 5 ? 'SSR' : r >= 4 ? 'SR' : 'R');
