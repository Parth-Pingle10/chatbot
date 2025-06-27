public class Random {


    public static void main(String[] args) {
        int n=20;
        for(int i=0;i<n;i++){
            int randomNum = 32+(int)(Math.random() * 95);
            char character= (char) randomNum;
            System.out.print(character);

        }
        System.out.println();
        System.out.println();
    }

}