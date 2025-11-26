import{test ,  expect } from "@playwright/test";
import { EasyMyTripPageForFlight } from "../pages/easyMyTripForFlight";   
import { FileUtils } from "@utils/fileUtils";






test("EasyMyTrip fight Booking Test", async ({ page },testInfo) => {
    const easyMyTripPage = new EasyMyTripPageForFlight(page);    

    await easyMyTripPage.easyMyTripFlightBookingPage();  
    await easyMyTripPage.selectFlightDates();
    await easyMyTripPage.selectPassengers();
     const hotelList  = await easyMyTripPage.getHighestHotelAndClick();

      await FileUtils.writeExcelAuto(testInfo , hotelList)
   const  fightlist = await easyMyTripPage.Chectout();
     await FileUtils.writeExcelAuto(testInfo , fightlist)



});
