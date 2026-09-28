import { useContext } from "react";
import { Badge, Box, Flex, HStack, Icon, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { FiArrowDownLeft, FiArrowUpRight, FiEdit2, FiTrash2 } from "react-icons/fi";
import { GlobalContext } from "../../context";

export default function ExpenseView({ data, onEdit }) {
  const { deleteTransaction } = useContext(GlobalContext);
  return (
    <Box w="full">
      {data.map((item) => {
        const income = item.type === "income";
        return <Flex key={item.id} className="transaction-row" align="center" justify="space-between" gap={3}>
          <HStack spacing={3} minW={0}>
            <Flex className={`transaction-icon ${income ? "income-row-icon" : "expense-row-icon"}`} align="center" justify="center"><Icon as={income ? FiArrowDownLeft : FiArrowUpRight} boxSize={4} /></Flex>
            <Box minW={0}><Text fontWeight="600" color="gray.800" noOfLines={1}>{item.description}</Text><HStack spacing={2} mt={1}><Text fontSize="xs" color="gray.500">{new Date(item.date || Number(item.id.split("-")[0]) || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</Text><Badge className="category-badge">{item.category || "Other"}</Badge></HStack></Box>
          </HStack>
          <HStack spacing={{ base: 1, sm: 4 }} flexShrink={0}>
            <Text fontWeight="700" color={income ? "green.600" : "gray.800"} whiteSpace="nowrap">{income ? "+" : "−"}₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Tooltip label="Edit transaction"><IconButton aria-label={`Edit ${item.description}`} icon={<FiEdit2 />} size="sm" variant="ghost" color="gray.400" _hover={{ color: "blue.500", bg: "blue.50" }} onClick={() => onEdit(item)} /></Tooltip>
            <Tooltip label="Delete transaction"><IconButton aria-label={`Delete ${item.description}`} icon={<FiTrash2 />} size="sm" variant="ghost" color="gray.400" _hover={{ color: "red.500", bg: "red.50" }} onClick={() => deleteTransaction(item.id)} /></Tooltip>
          </HStack>
        </Flex>;
      })}
    </Box>
  );
}
