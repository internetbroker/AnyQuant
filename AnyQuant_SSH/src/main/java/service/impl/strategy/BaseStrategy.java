package service.impl.strategy;

import DAO.BenchMarkDAO;
import DAO.FactorDAO;
import DAO.StockDataDAO;
import org.springframework.beans.factory.annotation.Autowired;
import util.MyDate;
import vo.CumRtnVO;
import vo.ReportVO;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 67534 on 2016/5/25.
 */
public abstract class BaseStrategy  {

    @Autowired
    StockDataDAO stockDataDAO;
    @Autowired
    BenchMarkDAO benchMarkDAO;
    @Autowired
    FactorDAO factorDAO;
    /**
     * 每手100股
     */
    public static final int stocksPerLot=100;

    /**
     * 起始资金
     */
    protected double capital = 100000;
    /**
     * 交易费率
     */
    protected double taxRate = 0.003;

    /**
     * 基准大盘代码
     */
    protected String baseCode;

    /**
     * 回测周期开始日期
     */
    protected MyDate start;

    /**
     * 回测周期结束日期
     */
    protected MyDate end;

    /**
     * 调仓间隔
     */
    protected int interval;
    /**
     * 当前的交易日
     */
    protected MyDate curTradeDay;




    /**
     * 卖出股票累积收益
     */
    protected double income;
    /**
     * 买入股票的累积花费
     */
    protected double expense;
    /**
     * 累积交的税
     */
    protected double tax;

    /**
     * 累积纯利润=累积收益-累积花费
     */
    protected double profit;

    /**
     * 累积收益率(回测)
     */
    protected double cumRtnRate;


    /**
     * 记录指数在调仓日的买入价格
     */
    protected double base_BuyPrice;
    /**
     * 记录指数在调仓日的卖出价格
     */
    protected double base_SellPrice;

    /**
     * 指数的累积收益率
     */
    protected double baseRtnRate;

    /**
     * 每次调仓时的累积收益率
     */
    protected List<CumRtnVO> cumRtnVOList;


    /**
     * 存储start--end间的交易日
     */
    protected MyDate[] validDates;



    public BaseStrategy(){

    }

    public void setPara(double capital, double taxRate, String baseCode ,
                        MyDate start , MyDate end){

        this.capital=capital;
        this.taxRate=taxRate;
        this.baseCode=baseCode;
        this.start=start;
        this.end=end;
        this.curTradeDay=start;
        this.interval=1;

        this.income=0;
        this.expense=0;
        this.tax=0;
        this.profit=0;
        this.cumRtnRate=0;
        this.base_BuyPrice=0;
        this.base_SellPrice=0;
        this.baseRtnRate=0;
        this.cumRtnVOList=new ArrayList<>();

        this.computeValidDates();

    }


    public void computeValidDates(){
        List<MyDate> tempDates=stockDataDAO.getTradeDates(start,end);
        this.validDates = tempDates.toArray(new MyDate[tempDates.size()]);
        this.start=validDates[0];
        this.end=validDates[validDates.length-1];
    }
    /**
     * 初始化算法
     */
    public abstract  void init();

    /**
     * 如果是设定了调仓频率的策略，该方法即调仓时的动作
     * 如果是无需设定调仓频率的策略，该方法即算法主体
     */
    public abstract  void handleData();

    /**
     * 面向ui的接口
     * @return
     */
    public abstract ReportVO analyse();

    /**
     * 计算利润
     * @return
     */
    public double computeCumRtnRate(){
        profit=income-expense-tax;
        cumRtnRate=profit/expense;
        System.out.println("profit: " +this.profit+"  "+"expense: "+this.expense);
        return cumRtnRate;

    }

    public double computeBaseRtnRate(){
        base_SellPrice=benchMarkDAO.getAvgPrice(this.baseCode,curTradeDay);
        baseRtnRate+=(base_SellPrice-base_BuyPrice-base_SellPrice*taxRate)/base_BuyPrice;
        return baseRtnRate;
    }


    public ReportVO simpleAnalyse(){
        init();
        for(int i=interval;i<this.validDates.length;i+=interval){
            curTradeDay=this.validDates[i];
            System.out.println("handle "+i+"th day date: "+curTradeDay.DateToString());
            this.handleData();
        }
        ReportVO reportVO = new ReportVO();
        reportVO.cumRtnVOList=this.cumRtnVOList;

        return reportVO;
    }



}
