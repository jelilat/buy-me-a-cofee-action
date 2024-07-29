import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";

import { serializeTransaction, TransactionSerializable } from "viem";
import { parseUnits, encodeFunctionData } from "viem";

const app = express();

// Configure CORS
const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST"], // Allow only GET and POST requests
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Apply CORS to all routes
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const DONATION_DESTINATION_WALLET =
  "0x66fe4806cD41BcD308c9d2f6815AEf6b2e38f9a3";
const DONATION_AMOUNT_USDC_OPTIONS = [10, 50, 100];
const DEFAULT_DONATION_AMOUNT_USDC = 10;

const USDC_CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Mainnet USDC address

function generateHtmlWithMetaTags(
  title: string,
  description: string,
  imageUrl: string,
  amount?: string
): string {
  const baseUrl = "https://buy-me-a-cofee-action.vercel.app/api/tip";
  const urlToUnfurl = amount ? `${baseUrl}/${amount}` : baseUrl;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Twitter Card data -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@tjelailah">
    <meta name="twitter:creator" content="@tjelailah">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:url" content="${urlToUnfurl}">
    
    <!-- Open Graph data -->
    <meta property="og:title" content="${title}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${urlToUnfurl}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:description" content="${description}">
    
    <!-- Other meta tags -->
    <meta name="description" content="${description}">
    <script>
      // Delay redirect to allow metadata to be processed
      setTimeout(function() {
        document.getElementById('debug').textContent = 'Redirecting now...';
        window.location.href = "https://ethereum-blink-unfurler.vercel.app/?url=" + encodeURIComponent("${urlToUnfurl}");
      }, 5000);  // 5 seconds delay
    </script>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${imageUrl}" alt="${title}" style="max-width: 300px; height: auto;">
    <p id="debug">Waiting to redirect...</p>
    <p>If you are not redirected automatically, please <a href="https://ethereum-blink-unfurler.vercel.app/?url=${encodeURIComponent(
      urlToUnfurl
    )}">click here</a>.</p>
</body>
</html>
  `;
}

app.get("/api/tip", (req: Request, res: Response) => {
  const title = "Buy Me a Coffee";
  const description =
    "Support me by buying me a coffee using USDC. Choose an amount or enter a custom amount.";
  const imageUrl =
    "https://buy-me-a-cofee-action.vercel.app/images/buy-me-coffee.jpg";

  const jsonResponse = {
    title,
    icon: imageUrl,
    description,
    links: {
      actions: [
        ...DONATION_AMOUNT_USDC_OPTIONS.map((amount) => ({
          label: `${amount} USDC`,
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
    isEthereum: true,
  };

  const acceptHeader = req.get("Accept");
  const userAgent = req.get("User-Agent");

  // Check if it's likely to be the Twitter card scraper or a browser
  if (
    (acceptHeader && acceptHeader.includes("text/html")) ||
    (userAgent && userAgent.toLowerCase().includes("twitterbot"))
  ) {
    // If it's a browser or the Twitter scraper, send HTML with meta tags
    res.send(generateHtmlWithMetaTags(title, description, imageUrl));
  } else {
    // For all other cases, send the JSON response
    res.json(jsonResponse);
  }
});

app.get("/api/tip/:amount", (req: Request, res: Response) => {
  const amount = req.params.amount;
  const acceptHeader = req.get("Accept");
  const title = `Tip ${amount} USDC`;
  const description = `Tip ${amount} USDC to support.`;
  const imageUrl = "/images/buy-me-coffee.jpg";

  if (acceptHeader && acceptHeader.includes("text/html")) {
    // If the request accepts HTML, send the HTML page with meta tags
    res.send(generateHtmlWithMetaTags(title, description, imageUrl, amount));
  } else {
    // Otherwise, send the JSON response as before
    const response = {
      title,
      icon: imageUrl,
      description,
      links: {
        actions: [
          {
            label: "Buy Me a Coffee",
            href: `/api/tip?amount=${amount}`,
          },
        ],
      },
      isEthereum: true,
    };
    res.json(response);
  }
});

app.post("/api/tip", async (req: Request, res: Response) => {
  const { amount } = req.query;

  const transaction = await prepareUSDCTransaction(
    DONATION_DESTINATION_WALLET,
    amount as string,
    1
  );

  res.json({ transaction });
});

export async function prepareUSDCTransaction(
  to: `0x${string}`,
  amount: string,
  chainId: number
): Promise<string> {
  const transactionData: TransactionSerializable = {
    to: USDC_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: [
        {
          name: "transfer",
          type: "function",
          inputs: [
            { name: "recipient", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ type: "bool" }],
        },
      ],
      args: [to, parseUnits(amount, 6)], // USDC has 6 decimal places
    }),
    chainId,
    type: "eip1559",
  };
  const serializedTx = serializeTransaction(transactionData);
  return serializedTx;
}

export default app;
