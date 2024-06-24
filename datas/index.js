/*
 * 使用mockjs提供mock数据接口
 * */
import Mock from "mockjs";
import bookData from './data-list.json'

Mock.mock("/bookList", { code:0, data:bookData.bookList });


