
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const db = new sqlite3.Database("./eiscafe.db");

app.use(express.json());
app.use(cors());

// Datenbank einrichten
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, tableNumber TEXT, items TEXT, totalPrice REAL, time TEXT)");
});

// Bestellung speichern
app.post("/order", (req, res) => {
    const { table, items } = req.body;
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const time = new Date().toLocaleTimeString();
    db.run("INSERT INTO orders (tableNumber, items, totalPrice, time) VALUES (?, ?, ?, ?)", 
        [table, JSON.stringify(items), totalPrice, time], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, orderId: this.lastID });
        });
});

// Offene Bestellungen abrufen
app.get("/orders", (req, res) => {
    db.all("SELECT * FROM orders", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Bestellung als erledigt markieren
app.delete("/order/:id", (req, res) => {
    db.run("DELETE FROM orders WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log("Server läuft auf Port 3000"));
