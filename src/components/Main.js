require('normalize.css/normalize.css');
require('styles/App.scss');

var imageDatas = require('../data/imageDatas.json');

import React from 'react';
import ReactDOM from 'react-dom';

// let yeomanImage = require('../images/yeoman.png');
function getRangeRandom(low,high){
  return Math.ceil(Math.random() * (high - low) + low);
}
/** 
 * 获取0~30 之间的一个任意正负值
 * */
function get30DegRandom(){
  return (Math.random() > 0.5 ? '' :'-') + Math.ceil(Math.random() * 30);
}
class ImgFigure extends React.Component{
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(ev){
    if(this.props.arrRange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    // this.props.inverse();
    ev.stopPropagation();
    ev.preventDefault();
  }
  render(){
    let styleObj = {};
    if(this.props.arrRange.pos){
      styleObj = this.props.arrRange.pos;
    }
    if(this.props.arrRange.rotate){
      styleObj['transform'] = 'rotate(' + this.props.arrRange.rotate + 'deg)';
    }
    if(this.props.arrRange.isCenter){
      styleObj.zIndex = 11;
    }
    let imgFigureClassName = 'img-figure';
    imgFigureClassName +=this.props.arrRange.isInverse ? ' is-inverse' : '';
    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img className="img" src={this.props.data.imageUrl} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>{this.props.data.desc}</p>
          </div>
        </figcaption>
      </figure>
    )
  }
}
class ControllerUnit extends React.Component{
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(ev){
    //如果点击的是当前正在选中态的按钮，则翻转，否则居中
    if(this.props.arrRange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    ev.stopPropagation();
    ev.preventDefault();
  }
  render(){
    var controllerUnitClassName = "controller-unit";
    if(this.props.arrRange.isCenter){
      controllerUnitClassName +=" is-center";
      if(this.props.arrRange.isInverse){
        controllerUnitClassName +=" is-inverse";
      }
    }
    return (
      <span className={controllerUnitClassName} onClick={this.handleClick}></span>
    );
  }
}

class AppComponent extends React.Component {
  constructor(props){
    super(props);
    this.Constant = {
      centerPos:{
        left:0,
        top:0
      },
      hPosRange:{
        leftSecX:[0,0],
        rightSecX:[0,0],
        y:[0,0]
      },
      vPosRange:{
        x:[0,0],
        topY:[0,0]
      }
    };
    this.state = {
      imgsArrRangeArr:[
        // {
        //  pos:{
        //    left:'0',
        //    top:'0'
        //  },
        //  rotate:'0',
        //  isInverse:'false',
        //  isCenter:false      
        // }
      ]
    };
  }
  //在首次实例化时初始化contans,为每张图片计算其位置范围
  componentDidMount(){
    //首先拿到舞台的大小
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
      stageW = stageDOM.scrollWidth,
      stageH = stageDOM.scrollHeight,
      halfStageW = Math.ceil(stageW / 2),
      halfStageH = Math.ceil(stageH / 2);
    //拿到一个imageFigure的大小
    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
      imgW = imgFigureDOM.scrollWidth,
      imgH = imgFigureDOM.scrollHeight,
      halfImgW = Math.ceil(imgW / 2),
      halfImgH = Math.ceil(imgH / 2);
    //计算中心图片的位置点
    this.Constant.centerPos = {
      left:halfStageW - halfImgW,
      top:halfStageH - halfImgH
    };
    //计算左侧右侧区域图片排布位置的取值范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;
    //计算上侧区域图片排布位置的取值范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;
    this.rearRange(0);
  }

  /** 
   * 翻转图片
   * @param index 输入当前被执行inverse操作的图片对应的index值
   * return {function} 闭包函数
   * 
  */
  inverse(index){
    return function(){
      let imgsArrRangeArr = this.state.imgsArrRangeArr;
      imgsArrRangeArr[index].isInverse = !imgsArrRangeArr[index].isInverse;
      this.setState({
        imgsArrRangeArr:imgsArrRangeArr
      });
    }.bind(this)
  }
  /**
   * 利用rearRange函数，居中对应的index的图片
   * @param index，需要被居中的图片对应的图片index
   * return {function}
   */
  center(index){
    return function(){
      this.rearRange(index);
    }.bind(this);
  }
  /*重新布局所有图片
  *@param centerIndex  指定居中图片
  */
  rearRange(centerIndex){
    let imgsArrRangeArr = this.state.imgsArrRangeArr,
      Constant = this.Constant,
      centerPos = Constant.centerPos,
      hPosRange = Constant.hPosRange,
      vPosRange = Constant.vPosRange,
      hPosRangeLeftSecX = hPosRange.leftSecX,
      hPosRangeRightSecX = hPosRange.rightSecX,
      hPosRangeY = hPosRange.y,
      vPosRangeTopY = vPosRange.topY,
      vPosRangeX = vPosRange.x,

      imgsArrRangeTopArr = [],
      topImgNum = Math.floor(Math.random() * 2);//[0,1]
    let imgsArrRangeCenterArr = imgsArrRangeArr.splice(centerIndex,1);
      //首先居中centerIndex的图片
      imgsArrRangeCenterArr[0] = {
        pos : centerPos,
        rotate : 0,
        isCenter:true
      };
      
      //取出布局上侧的图片的状态信息
    let topImgSpliceIndex = Math.floor(Math.random() * imgsArrRangeArr.length - topImgNum);
      imgsArrRangeTopArr = imgsArrRangeArr.splice(topImgSpliceIndex,topImgNum);

      //布局位于上侧的图片
      imgsArrRangeTopArr.forEach(function(value,index){
        imgsArrRangeTopArr[index] = {
          pos: {
            top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
            left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
          },
          rotate : get30DegRandom(),
          isCenter:false
        };
      });

      //布局左右两侧的图片
      for(let i = 0, len = imgsArrRangeArr.length,k = len / 2;i < len;i++){
        let hPosRangeLORX = null;
        //前半部分布局左边，右半部分布局右边
        if(i < k){
          hPosRangeLORX = hPosRangeLeftSecX;
        }else{
          hPosRangeLORX = hPosRangeRightSecX;
        }
        imgsArrRangeArr[i] = {
          pos:{
            top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
            left:getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
          },
          rotate :get30DegRandom(),
          isCenter:false
        };
      }
      if(imgsArrRangeTopArr && imgsArrRangeTopArr[0]){
        imgsArrRangeArr.splice(topImgSpliceIndex,0,imgsArrRangeTopArr[0]);
      }
      imgsArrRangeArr.splice(centerIndex,0,imgsArrRangeCenterArr[0]);
      this.setState({
        imgsArrRangeArr:imgsArrRangeArr
      })
  }
    render() {
      var controllerUnits = [],
        imgFigures = [];
      imageDatas.forEach(function(item,index){
      if(!this.state.imgsArrRangeArr[index]){
        this.state.imgsArrRangeArr[index] ={
          pos:{
            left:0,
            top:0
          },
          rotate:0,
          isInverse:false,
          isCenter:false
        };
      }
        imgFigures.push(<ImgFigure key={index} data={item} ref={'imgFigure'+index} arrRange={this.state.imgsArrRangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} />)
      controllerUnits.push(<ControllerUnit key={index} arrRange={this.state.imgsArrRangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} />)
      }.bind(this));
    


      return (
        <section className="stage" ref="stage">
          <section className="img-sec">{imgFigures}</section>
          <nav className="controller-nav">{controllerUnits}</nav>
        </section>
      );
    }
}

AppComponent.defaultProps = {
};

export default AppComponent;
