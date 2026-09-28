import { useEffect, useState } from "react";
import {
  Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup,
  Select, Stack,
} from "@chakra-ui/react";
import { useContext } from "react";
import { GlobalContext } from "../../context";

export default function TransactionForm({ onClose, isOpen, transaction = null }) {
  const { handleFormSubmit, updateTransaction } = useContext(GlobalContext);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Other");

  useEffect(() => {
    if (!isOpen) return;
    setDescription(transaction ? transaction.description : "");
    setAmount(transaction ? String(transaction.amount) : "");
    setType(transaction ? transaction.type : "expense");
    setCategory(transaction ? transaction.category || "Other" : "Other");
  }, [isOpen, transaction]);

  function handleSubmit(event) {
    event.preventDefault();
    const data = { description, amount, type, category };
    const saved = transaction ? updateTransaction(transaction.id, data) : handleFormSubmit(data);
    if (saved) {
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("Other");
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent as="form" onSubmit={handleSubmit} borderRadius="2xl" mx={4}>
        <ModalHeader>{transaction ? "Edit transaction" : "Add a transaction"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Description</FormLabel>
            <Input autoFocus placeholder="e.g. Weekly groceries" value={description} onChange={(event) => setDescription(event.target.value)} />
          </FormControl>
          <FormControl isRequired mb={4}>
            <FormLabel>Amount</FormLabel>
            <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Category</FormLabel>
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              {["Other", "Food", "Transport", "Shopping", "Housing", "Health", "Salary", "Freelance", "Entertainment"].map((item) => <option key={item}>{item}</option>)}
            </Select>
          </FormControl>
          <RadioGroup value={type} onChange={setType}>
            <Stack direction="row" spacing={6}>
              <Radio value="expense" colorScheme="red">Expense</Radio>
              <Radio value="income" colorScheme="green">Income</Radio>
            </Stack>
          </RadioGroup>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" type="submit">{transaction ? "Save changes" : "Save transaction"}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
