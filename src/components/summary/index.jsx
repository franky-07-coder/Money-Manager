import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import TransactionForm from "../add-transaction";
import TransactionChartSummary from "../chart";

export default function Summary({ onClose, isOpen, totalExpense, totalIncome, periodLabel = "All time" }) {
  const hasData = totalIncome > 0 || totalExpense > 0;
  return (
    <Box className="chart-panel">
      <Flex justify="space-between" align={{ base: "start", sm: "center" }} gap={2} mb={4}>
        <Box><Heading size="sm" color="gray.800">Income & expenses</Heading><Text color="gray.500" fontSize="sm" mt={1}>Your cash flow breakdown</Text></Box>
        <Text className="period-tag">{periodLabel.toUpperCase()}</Text>
      </Flex>
      <Flex align="center" justify="center" minH="230px" position="relative">
        {hasData ? <TransactionChartSummary expense={totalExpense} income={totalIncome} /> : <Box textAlign="center" color="gray.500"><Text fontSize="3xl">◔</Text><Text fontSize="sm">Your chart will appear here</Text></Box>}
      </Flex>
      <Flex justify="center" gap={{ base: 8, sm: 16 }} mt={2}>
        <Flex align="center" gap={2}><Box className="legend-dot income-dot" /><Box><Text className="legend-label">INCOME</Text><Text fontWeight="700" color="gray.700">₹{totalIncome.toLocaleString("en-IN")}</Text></Box></Flex>
        <Flex align="center" gap={2}><Box className="legend-dot expense-dot" /><Box><Text className="legend-label">EXPENSES</Text><Text fontWeight="700" color="gray.700">₹{totalExpense.toLocaleString("en-IN")}</Text></Box></Flex>
      </Flex>
      <TransactionForm onClose={onClose} isOpen={isOpen} />
    </Box>
  );
}
