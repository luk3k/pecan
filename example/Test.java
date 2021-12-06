class Test {
    Printer printer = new Printer();

    public static void main(String[] args) {
        printHello();
        Printer p = new Printer();
        p.print("What's up?");
        p.printMultiple("text1", "text2");
        p.printMultiple("print", "again");
    }

    private static void printHello() {
        System.out.println("Hello");
    }

    static class Printer {
        public Printer() {}

        public void print(String text) {
            System.out.println(text);
        }

        public void printMultiple(String text1, String text2) {
            System.out.println(text1 + text2);
        }
    }
}
