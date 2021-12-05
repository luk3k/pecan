class Test {
    public static void main(String[] args) {
        printHello();
        Printer p = new Printer();
        p.print("What's up?");
        p.printMultiple("text1", "text2");
        p.printMultiple("print", "again");
        Printer2 p2 = new Printer();
    }

    private static void printHello() {
        System.out.println("Hello");
    }

    class Printer {
        public Printer() {}

        public void print(String text) {
            System.out.println(text);
        }

        public void printMultiple(String text1, String text2) {
            System.out.println(text1 + text2);
        }
    }
}
