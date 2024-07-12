"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Configure CORS
const corsOptions = {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allow only GET and POST requests
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions)); // Apply CORS to all routes
app.use(express_1.default.json());
const DONATION_DESTINATION_WALLET = "0x66fe4806cD41BcD308c9d2f6815AEf6b2e38f9a3";
const DONATION_AMOUNT_ETH_OPTIONS = [0.01, 0.1, 1];
const DEFAULT_DONATION_AMOUNT_ETH = 0.01;
app.get("/api/tip", (req, res) => {
    const response = {
        title: "Buy Me a Coffee",
        icon: "/images/buy-me-coffe.jpg",
        description: "Support me by buying me a coffee using ETH. Choose an amount or enter a custom amount.",
        links: {
            actions: [
                ...DONATION_AMOUNT_ETH_OPTIONS.map((amount) => ({
                    label: `${amount} ETH`,
                    href: `/api/tip?amount=${amount}`,
                })),
                {
                    href: `/api/tip?amount={amount}`,
                    label: "Custom Amount",
                    parameters: [
                        {
                            name: "amount",
                            label: "Enter a custom USD amount",
                        },
                    ],
                },
            ],
        },
    };
    res.json(response);
});
app.get("/api/tip/:amount", (req, res) => {
    const amount = req.params.amount;
    const response = {
        title: `Tip ${amount} ETH`,
        icon: "/images/buy-me-coffe.jpg",
        description: `Tip ${amount} ETH to support.`,
        links: {
            actions: [
                {
                    label: "Buy Me a Coffee",
                    href: `/api/tip?amount=${amount}`,
                },
            ],
        },
    };
    res.json(response);
});
app.post("/api/tip", (req, res) => {
    const { amount } = req.query;
    const transaction = {
        to: DONATION_DESTINATION_WALLET,
        value: amount,
    };
    // Logic to handle the transaction creation and processing
    res.json({ transaction: JSON.stringify(transaction) });
});
app.use(express_1.default.static("public"));
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
