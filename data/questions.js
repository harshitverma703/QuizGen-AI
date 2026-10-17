// Starter question bank. We can expand this and later add live AI generation.
// Each question's answer is the exact text of the correct option.
module.exports = [
  {
    id: "ds-e-1", topic: "Data Structures", difficulty: "Easy",
    question: "Which data structure follows the LIFO principle?",
    options: ["Queue", "Stack", "Linked list", "Tree"],
    answer: "Stack",
    explanation: "A stack follows Last In, First Out (LIFO): the last item added is removed first."
  },
  {
    id: "ds-e-2", topic: "Data Structures", difficulty: "Easy",
    question: "Which data structure follows the FIFO principle?",
    options: ["Stack", "Graph", "Queue", "Heap"],
    answer: "Queue",
    explanation: "A queue follows First In, First Out (FIFO): the first item added is removed first."
  },
  {
    id: "ds-e-3", topic: "Data Structures", difficulty: "Easy",
    question: "Which structure stores elements in connected nodes?",
    options: ["Linked list", "Integer", "Boolean", "Character"],
    answer: "Linked list",
    explanation: "A linked list stores data in nodes connected through references or pointers."
  },
  {
    id: "ds-m-1", topic: "Data Structures", difficulty: "Medium",
    question: "What is the average time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    answer: "O(log n)",
    explanation: "Binary search halves the remaining search space at each step."
  },
  {
    id: "ds-m-2", topic: "Data Structures", difficulty: "Medium",
    question: "Which traversal of a binary search tree visits keys in sorted order?",
    options: ["Preorder", "Postorder", "Inorder", "Level order"],
    answer: "Inorder",
    explanation: "Inorder traversal visits the left subtree, root, and right subtree."
  },
  {
    id: "ds-m-3", topic: "Data Structures", difficulty: "Medium",
    question: "Which data structure is commonly used for breadth-first search?",
    options: ["Stack", "Queue", "Hash table only", "Binary search tree"],
    answer: "Queue",
    explanation: "BFS explores nodes level by level, using a queue to track the next nodes."
  },
  {
    id: "ds-h-1", topic: "Data Structures", difficulty: "Hard",
    question: "What is the worst-case time complexity of searching in an unbalanced binary search tree with n nodes?",
    options: ["O(log n)", "O(1)", "O(n)", "O(log log n)"],
    answer: "O(n)",
    explanation: "An unbalanced tree can become a chain, requiring a linear scan."
  },
  {
    id: "ds-h-2", topic: "Data Structures", difficulty: "Hard",
    question: "Which data structure is most directly suited to repeatedly retrieving the highest-priority item?",
    options: ["Priority queue", "Ordinary linked list only", "Stack", "Circular array only"],
    answer: "Priority queue",
    explanation: "A priority queue retrieves items according to priority, often implemented with a heap."
  },
  {
    id: "js-e-1", topic: "JavaScript", difficulty: "Easy",
    question: "Which keyword declares a block-scoped variable that can be reassigned?",
    options: ["const", "let", "static", "define"],
    answer: "let",
    explanation: "let declares a block-scoped variable whose value can be reassigned."
  },
  {
    id: "js-e-2", topic: "JavaScript", difficulty: "Easy",
    question: "Which method converts a JSON string into a JavaScript value?",
    options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.read()"],
    answer: "JSON.parse()",
    explanation: "JSON.parse() parses JSON text into a JavaScript value."
  },
  {
    id: "js-m-1", topic: "JavaScript", difficulty: "Medium",
    question: "What does Array.prototype.map() return?",
    options: ["Always a number", "A new array", "The original array only", "A boolean"],
    answer: "A new array",
    explanation: "map() creates a new array from the return value of its callback for each element."
  },
  {
    id: "js-m-2", topic: "JavaScript", difficulty: "Medium",
    question: "Which operator checks both value and type equality?",
    options: ["==", "=", "===", "!="],
    answer: "===",
    explanation: "The strict equality operator === compares without type coercion."
  },
  {
    id: "web-e-1", topic: "Web Development", difficulty: "Easy",
    question: "What does HTML primarily define?",
    options: ["Page structure and content", "Database indexes", "Server memory", "Network routing"],
    answer: "Page structure and content",
    explanation: "HTML provides the structure and meaning of web page content."
  },
  {
    id: "web-e-2", topic: "Web Development", difficulty: "Easy",
    question: "Which CSS property changes the text color?",
    options: ["font-style", "background", "color", "text-weight"],
    answer: "color",
    explanation: "The CSS color property sets the foreground color of text."
  },
  {
    id: "web-m-1", topic: "Web Development", difficulty: "Medium",
    question: "Which HTTP method is commonly used to create a resource?",
    options: ["GET", "POST", "HEAD", "OPTIONS"],
    answer: "POST",
    explanation: "POST is commonly used to submit data that creates or processes a resource."
  },
  {
    id: "web-m-2", topic: "Web Development", difficulty: "Medium",
    question: "What does responsive web design aim to do?",
    options: ["Work well across different screen sizes", "Require a separate domain per device", "Disable mobile access", "Only improve server speed"],
    answer: "Work well across different screen sizes",
    explanation: "Responsive layouts adapt to phones, tablets, laptops, and larger screens."
  }
];
