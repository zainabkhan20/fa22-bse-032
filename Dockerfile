FROM node:alpine
WORKDIR /app
COPY . .
# Agar aapki app simple HTML hai to node ki zaroorat nahi, 
# lekin ye sample building ke liye kafi hai.
CMD ["echo", "Hello COMSATS! Build Successful"]