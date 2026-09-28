import { useContext, useMemo, useRef, useState } from "react";
import {
  Box, Button, Flex, Heading, HStack, Icon, Input, InputGroup,
  InputLeftElement, SimpleGrid, Text, useDisclosure, useToast, VStack,
} from "@chakra-ui/react";
import { FiArrowDownLeft, FiArrowUpRight, FiCreditCard, FiDownload, FiEdit2, FiPlus, FiSearch, FiTrendingUp, FiUpload } from "react-icons/fi";
import { GlobalContext } from "../../context";
import Summary from "../summary";
import ExpenseView from "../expense-view";
import TransactionForm from "../add-transaction";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
const localMonth = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted && char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("The CSV contains an unclosed quote.");
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((item) => item.some((value) => value.trim()));
}

export default function Main() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { totalExpense, totalIncome, allTransactions, importTransactions } = useContext(GlobalContext);
  const toast = useToast();
  const importInput = useRef(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(localMonth(new Date()));
  const balance = totalIncome - totalExpense;

  const monthTransactions = useMemo(() => allTransactions.filter((item) => {
    const date = new Date(item.date || Number(item.id.split("-")[0]) || Date.now());
    return localMonth(date) === selectedMonth;
  }), [allTransactions, selectedMonth]);
  const monthTotals = useMemo(() => monthTransactions.reduce((totals, item) => {
    const amount = Number(item.amount) || 0;
    if (item.type === "income") totals.income += amount;
    else totals.expense += amount;
    return totals;
  }, { income: 0, expense: 0 }), [monthTransactions]);

  const visibleTransactions = useMemo(() => monthTransactions.filter((item) => {
    const matchesType = filter === "all" || item.type === filter;
    return matchesType && `${item.description} ${item.category || ""}`.toLowerCase().includes(query.toLowerCase());
  }), [monthTransactions, filter, query]);
  const expenseCount = allTransactions.filter((item) => item.type === "expense").length;
  const monthLabel = new Date(`${selectedMonth}-02T12:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const savingsRate = monthTotals.income > 0 ? Math.round(((monthTotals.income - monthTotals.expense) / monthTotals.income) * 100) : null;

  function shiftMonth(offset) {
    const [year, month] = selectedMonth.split("-").map(Number);
    setSelectedMonth(localMonth(new Date(year, month - 1 + offset, 1)));
  }

  function exportCsv() {
    const headers = ["description", "amount", "type", "category", "date"];
    const lines = [headers, ...allTransactions.map((item) => headers.map((key) => item[key] || ""))]
      .map((row) => row.map(csvCell).join(","));
    const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `money-manager-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result).replace(/^\uFEFF/, ""));
        const headers = rows.shift()?.map((header) => header.trim().toLowerCase());
        const required = ["description", "amount", "type"];
        if (!headers || required.some((header) => !headers.includes(header))) throw new Error("CSV needs description, amount, and type columns.");
        const dateIndex = headers.indexOf("date");
        const imported = rows.map((values, index) => {
          const data = Object.fromEntries(headers.map((header, column) => [header, values[column] || ""]));
          const amount = Number(data.amount);
          const type = data.type.trim().toLowerCase();
          if (!data.description.trim() || !Number.isFinite(amount) || amount <= 0 || !["income", "expense"].includes(type)) {
            throw new Error(`Invalid transaction on CSV row ${index + 2}.`);
          }
          const date = dateIndex >= 0 && data.date && !Number.isNaN(Date.parse(data.date)) ? new Date(data.date).toISOString() : new Date().toISOString();
          return { id: `${Date.now()}-${index}-${Math.random()}`, description: data.description.trim(), amount, type, category: data.category.trim() || "Other", date };
        });
        if (!imported.length) throw new Error("This CSV has no transactions to import.");
        importTransactions(imported);
        toast({ title: `${imported.length} transactions imported`, status: "success", duration: 3500, isClosable: true });
      } catch (error) {
        toast({ title: "Could not import CSV", description: error.message, status: "error", duration: 5000, isClosable: true });
      }
    };
    reader.onerror = () => toast({ title: "Could not read this file", status: "error", duration: 4000, isClosable: true });
    reader.readAsText(file);
  }

  return (
    <Box className="dashboard-shell">
      <Flex className="topbar" justify="space-between" align="center" gap={4}>
        <HStack spacing={3}>
          <Flex className="brand-mark" align="center" justify="center"><Icon as={FiCreditCard} boxSize={5} /></Flex>
          <Box><Text className="eyebrow">PERSONAL FINANCE</Text><Heading size="md" color="gray.800">Money Manager</Heading></Box>
        </HStack>
        <HStack className="topbar-actions" spacing={2}>
          <Input ref={importInput} type="file" accept=".csv,text/csv" display="none" onChange={handleImport} />
          <Button leftIcon={<FiUpload />} variant="outline" colorScheme="blue" onClick={() => importInput.current?.click()} borderRadius="xl">Import CSV</Button>
          <Button leftIcon={<FiDownload />} variant="outline" colorScheme="blue" onClick={exportCsv} borderRadius="xl">Export CSV</Button>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen} borderRadius="xl" px={5}>Add transaction</Button>
        </HStack>
      </Flex>

      <Box className="welcome-row" mb={7}>
        <Box><Text className="eyebrow">YOUR MONEY, AT A GLANCE</Text><Heading size="lg" color="gray.800" mt={1}>Good to see you.</Heading><Text color="gray.500" mt={1}>Here’s how your finances are looking today.</Text></Box>
        <HStack className="date-pill" spacing={2}><Icon as={FiTrendingUp} color="blue.500" /><Text>{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</Text></HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={4} mb={5}>
        <Box className="metric-card balance-card"><Flex justify="space-between" align="start"><Box><Text className="metric-label">TOTAL BALANCE</Text><Heading className="balance-value">{money(balance)}</Heading><Text className="metric-note">Income minus expenses</Text></Box><Flex className="metric-icon balance-icon"><Icon as={FiCreditCard} boxSize={5} /></Flex></Flex></Box>
        <Box className="metric-card"><Flex justify="space-between" align="start"><Box><Text className="metric-label">TOTAL INCOME</Text><Heading className="metric-value">{money(totalIncome)}</Heading><Text className="metric-note">Money received</Text></Box><Flex className="metric-icon income-icon"><Icon as={FiArrowDownLeft} boxSize={5} /></Flex></Flex></Box>
        <Box className="metric-card"><Flex justify="space-between" align="start"><Box><Text className="metric-label">TOTAL EXPENSES</Text><Heading className="metric-value">{money(totalExpense)}</Heading><Text className="metric-note">Across {expenseCount} transactions</Text></Box><Flex className="metric-icon expense-icon"><Icon as={FiArrowUpRight} boxSize={5} /></Flex></Flex></Box>
      </SimpleGrid>

      <Box className="report-panel" mb={5}>
        <Flex justify="space-between" align={{ base: "start", sm: "center" }} gap={4} wrap="wrap" mb={4}>
          <Box><Text className="eyebrow">MONTHLY REPORT</Text><Heading size="md" color="gray.800" mt={1}>{monthLabel}</Heading></Box>
          <HStack className="month-controls" spacing={2}>
            <Button aria-label="Previous month" size="sm" variant="outline" onClick={() => shiftMonth(-1)}>‹</Button>
            <Input aria-label="Choose report month" type="month" value={selectedMonth} onChange={(event) => event.target.value && setSelectedMonth(event.target.value)} maxW="170px" size="sm" borderRadius="lg" />
            <Button aria-label="Next month" size="sm" variant="outline" onClick={() => shiftMonth(1)} maxW="40px">›</Button>
          </HStack>
        </Flex>
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
          <Box className="report-stat"><Text className="metric-label">INCOME</Text><Text className="report-number income-number">{money(monthTotals.income)}</Text></Box>
          <Box className="report-stat"><Text className="metric-label">EXPENSES</Text><Text className="report-number expense-number">{money(monthTotals.expense)}</Text></Box>
          <Box className="report-stat"><Text className="metric-label">SAVINGS RATE</Text><Text className="report-number">{savingsRate === null ? "—" : `${savingsRate}%`}</Text><Text className="metric-note">{savingsRate === null ? "Add income to calculate" : `${money(monthTotals.income - monthTotals.expense)} net this month`}</Text></Box>
        </SimpleGrid>
      </Box>

      <Summary totalExpense={monthTotals.expense} totalIncome={monthTotals.income} periodLabel={monthLabel} isOpen={isOpen} onClose={onClose} />

      <Box className="transactions-panel" mt={5}>
        <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={4} mb={5}>
          <Box><Heading size="md" color="gray.800">Transactions</Heading><Text color="gray.500" fontSize="sm" mt={1}>{monthLabel} · {monthTransactions.length} transactions</Text></Box>
          <HStack spacing={3} flexWrap="wrap">
            <InputGroup maxW={{ base: "full", md: "220px" }}><InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="gray.400" /></InputLeftElement><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions" bg="white" borderRadius="lg" /></InputGroup>
            <HStack className="filter-pills" spacing={1}>{["all", "expense", "income"].map((item) => <Button key={item} size="sm" variant={filter === item ? "solid" : "ghost"} colorScheme={filter === item ? "blue" : "gray"} onClick={() => setFilter(item)} textTransform="capitalize" borderRadius="lg">{item === "all" ? "All" : item}</Button>)}</HStack>
          </HStack>
        </Flex>
        {visibleTransactions.length ? <ExpenseView data={visibleTransactions} onEdit={setEditingTransaction} /> : <VStack className="empty-state" spacing={3}><Flex className="empty-icon" align="center" justify="center"><Icon as={query || filter !== "all" ? FiSearch : FiCreditCard} boxSize={6} /></Flex><Heading size="sm" color="gray.700">{query || filter !== "all" ? "No matching transactions" : "No transactions this month"}</Heading><Text color="gray.500" fontSize="sm">{query || filter !== "all" ? "Try another search or filter." : "Choose another month or add a transaction to get started."}</Text>{!query && filter === "all" && <Button size="sm" leftIcon={<FiPlus />} variant="outline" colorScheme="blue" onClick={onOpen}>Add transaction</Button>}</VStack>}
      </Box>
      <TransactionForm transaction={editingTransaction} isOpen={Boolean(editingTransaction)} onClose={() => setEditingTransaction(null)} />
      <Text className="footer-note">Your financial snapshot · Stored privately in this browser</Text>
    </Box>
  );
}
