import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";

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
const DONATION_AMOUNT_ETH_OPTIONS = [0.01, 0.1, 1];
const DEFAULT_DONATION_AMOUNT_ETH = 0.01;

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
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${imageUrl}" alt="${title}" style="max-width: 100%; height: auto;">
</body>
</html>
  `;
}

app.get("/api/tip", (req: Request, res: Response) => {
  console.log("Received request for /api/tip");
  console.log("Accept header:", req.get("Accept"));
  console.log("User-Agent:", req.get("User-Agent"));

  const title = "Buy Me a Coffee";
  const description =
    "Support me by buying me a coffee using ETH. Choose an amount or enter a custom amount.";
  const imageUrl =
    "https://buy-me-a-cofee-action.vercel.app/images/buy-me-coffe.jpg";

  const jsonResponse = {
    title,
    icon: imageUrl,
    description,
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
  console.log("Received request for /tip/:amount");
  console.log("Amount:", req.params.amount);
  console.log("Accept header:", req.get("Accept"));

  const amount = req.params.amount;
  const acceptHeader = req.get("Accept");
  const title = `Tip ${amount} ETH`;
  const description = `Tip ${amount} ETH to support.`;
  const imageUrl = "/images/buy-me-coffe.jpg";

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
    };
    res.json(response);
  }
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

export default app;
