import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

// Configure CORS
const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST"], // Allow only GET and POST requests
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Apply CORS to all routes
app.use(express.json());

const DONATION_DESTINATION_WALLET =
  "0x66fe4806cD41BcD308c9d2f6815AEf6b2e38f9a3";
const DONATION_AMOUNT_ETH_OPTIONS = [0.01, 0.1, 1];
const DEFAULT_DONATION_AMOUNT_ETH = 0.01;

app.get("/api/tip", (req: Request, res: Response) => {
  const response = {
    title: "Buy Me a Coffee",
    icon: "https://dl.openseauserdata.com/cache/originImage/files/82569bec99a03fc59005c121383fe13d.png",
    description:
      "Support me by buying me a coffee using ETH. Choose an amount or enter a custom amount.",
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

app.get("/api/tip/:amount", (req: Request, res: Response) => {
  const amount = req.params.amount;
  const response = {
    title: `Tip ${amount} ETH`,
    icon: "https://dl.openseauserdata.com/cache/originImage/files/82569bec99a03fc59005c121383fe13d.png",
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

app.post("/api/tip", (req: Request, res: Response) => {
  const { amount } = req.query;

  const transaction = {
    to: DONATION_DESTINATION_WALLET,
    value: amount,
  };
  // Logic to handle the transaction creation and processing
  res.json({ transaction: JSON.stringify(transaction) });
});

app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
