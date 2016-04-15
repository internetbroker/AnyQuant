package blimpl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import blHelper.VOPOchange;

import java.util.TreeMap;

import blservice.OptionalStockBLService;
import dataservice.APIDataFactory;
import dataservice.OptionalStockDataService;
import po.StockPO;
import vo.StockVO;

/**
 * Optional Stocks Business Logic Implement
 * @author Qiang
 * @date 3/29/16.
 */
public class OptionalStockBLImpl implements OptionalStockBLService {


	private static OptionalStockBLService bl;
	private OptionalStockDataService APIDataSer;

	private List<StockVO> optionStocks;
	private Map<String, StockVO> optionalStockMap;

	public static OptionalStockBLService getOptionalBLService() {
		if (bl == null) {
			bl = new OptionalStockBLImpl();
		}
		return bl;
	}

	private OptionalStockBLImpl() {
		APIDataSer = APIDataFactory.getOptionalStockDataService();

		refreshOptionalStocks();

	}

	@Override
	public Iterator<StockVO> getOptionalStocks() {
		refreshOptionalStocks();
		return optionStocks.iterator();

		// return APIDataSer.getOptionalStocks(VOPOchange.POtoVO(o));
	}

	@Override
	public boolean addStockCode(String stockCode) {
		return APIDataSer.addOptionalStock(stockCode);
	}

	@Override
	public boolean deleteStockCode(String stockCode) {
		return APIDataSer.deleteOptionalStock(stockCode);
	}

	@Override
	public boolean deleteStockCode(List<String> stockCode) {
		boolean result = true;
		for (String stock : stockCode) {
			result = result && APIDataSer.deleteOptionalStock(stock);
		}
		return result;
	}

	@Override
	public boolean addStockCode(List<String> stockCodes) {
		boolean result = true;
		for (String stock : stockCodes) {
			result = result && APIDataSer.addOptionalStock(stock);
		}
		return result;
	}

	@Override
	public boolean clearOptionalStocks() {
		return APIDataSer.clearOptionalStocks();
	}


//
//	@Override
//	public Iterator<Entry<String, Integer>> getRegionDistribution() {
//		refreshOptionalStocks();
//
//		regions = new HashMap<>(34);
//		StockVO temp;
//		for (int i = 0; i < optionStocks.size(); i++) {
//			temp = optionStocks.get(i);
//			if (regions.containsKey(temp.region)) {
//				regions.put(temp.region, regions.get(temp.region).intValue() + 1);
//			} else {
//				regions.put(temp.region, 1);
//			}
//		}
//
//		return regions.entrySet().iterator();
//	}
	
	@Override
	public Map<String, Integer> getRegionDistributionMap() {
		refreshOptionalStocks();

		Map<String, Integer> regions = new HashMap<>(34);

		for (StockVO temp : optionStocks) {
			if (regions.containsKey(temp.region)) {
				regions.put(temp.region, regions.get(temp.region) + 1);
			} else {
				regions.put(temp.region, 1);
			}
		}

		return regions;
	}

//	@Override
//	public Iterator<Entry<String, Integer>> getBoardDistribution() {
//		refreshOptionalStocks();
//
//		boards = new HashMap<>(34);
//		StockVO temp;
//		for (int i = 0; i < optionStocks.size(); i++) {
//			temp = optionStocks.get(i);
//			if (boards.containsKey(temp.board)) {
//				boards.put(temp.board, boards.get(temp.board) + 1);
//			} else {
//				boards.put(temp.board, 1);
//			}
//		}
//
//		return boards.entrySet().iterator();
//
//	}
	@Override
	public Map<String, Integer>  getBoardDistributionMap() {
		refreshOptionalStocks();

		Map<String, Integer> boards = new HashMap<>(34);

		for (StockVO temp : optionStocks) {
			if (boards.containsKey(temp.board)) {
				boards.put(temp.board, boards.get(temp.board) + 1);
			} else {
				boards.put(temp.board, 1);
			}
		}

		return boards;

	}


	private void refreshOptionalStocks() {
		Iterator<StockPO> pos = APIDataSer.getOptionalStocks();
		optionalStockMap = new TreeMap<>();
		StockPO po;
		while (pos.hasNext()) {
			po = pos.next();
			optionalStockMap.put(po.getCode(), (StockVO) VOPOchange.POtoVO(po));
		}
		optionStocks = new ArrayList<>(optionalStockMap.values());
	}

	@Override
	public boolean ifStockExist(String stockCode) {
		refreshOptionalStocks();
		return optionalStockMap.containsKey(stockCode);
	}
}
